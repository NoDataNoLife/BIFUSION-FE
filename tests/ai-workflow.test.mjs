import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
await mkdir('node_modules/.tmp', { recursive: true });
const directory = await mkdtemp(resolve('node_modules/.tmp/ai-tests-'));
after(() => rm(directory, { recursive: true, force: true }));
const outfile = resolve(directory, 'workflow.cjs');
await build({
  stdin: {
    contents: `
      export { default as api } from './src/lib/axios';
      export { AxiosError } from 'axios';
      export { uploadTempFiles } from './src/lib/fileUpload';
      export { useJobStore } from './src/store/useJobStore';
      export { useAuthStore } from './src/store/useAuthStore';
      export { shouldRetryJobQuery } from './src/lib/jobErrors';
      export { fetchProjectJobPages } from './src/lib/projectJobs';
      export { saveInferenceInputs, readInferenceInputs } from './src/lib/inferenceInputs';
      export { default as AugmentResultPage } from './src/pages/dashboard/AugmentResultPage';
      export { default as TrainResultPage } from './src/pages/dashboard/TrainResultPage';
      export { default as InferenceResultPage } from './src/pages/dashboard/InferenceResultPage';
      export { createElement } from 'react';
      export { renderToString } from 'react-dom/server';
      export { MemoryRouter, Routes, Route } from 'react-router-dom';
    `,
    resolveDir: process.cwd(), loader: 'ts',
  },
  outfile, bundle: true, platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'empty' },
  define: { 'import.meta.env.VITE_API_URL': "''" },
});
const { default: workflow } = await import(pathToFileURL(outfile));
const { api, AxiosError, uploadTempFiles, useJobStore, useAuthStore, shouldRetryJobQuery,
  fetchProjectJobPages, saveInferenceInputs, readInferenceInputs,
  createElement: h, renderToString, MemoryRouter, Routes, Route } = workflow;
const response = (config, data) => ({ config, data: { data }, status: 200, statusText: 'OK', headers: {} });
const httpError = (config, status) => new AxiosError('request failed', 'ERR_BAD_RESPONSE', config, null, {
  config, data: { message: '접근할 수 없습니다.' }, status, statusText: '', headers: {},
});

test('partial uploads reuse successful IDs and preserve file order and names', async () => {
  const files = ['normal.png', 'anomaly.png'].map((name) => new File(['image'], name, { type: 'image/png' }));
  const cache = new Map();
  const calls = [];
  let fail = true;
  api.defaults.adapter = async (config) => {
    const file = config.data.get('files');
    calls.push(file.name);
    if (file.name === 'anomaly.png' && fail) throw new AxiosError('offline', 'ERR_NETWORK', config);
    return response(config, [{ fileId: file.name === 'normal.png' ? 101 : 102, fileUrl: '/image' }]);
  };
  await assert.rejects(uploadTempFiles(files, undefined, cache));
  assert.equal(cache.size, 1);
  fail = false;
  const result = await uploadTempFiles(files, undefined, cache);
  assert.deepEqual(calls, ['normal.png', 'anomaly.png', 'anomaly.png']);
  assert.deepEqual(result.map((file) => [file.fileId, file.originalFileName]), [[101, 'normal.png'], [102, 'anomaly.png']]);
});

test('invalid upload IDs are rejected before creating jobs', async () => {
  api.defaults.adapter = async (config) => response(config, [{ fileId: null, fileUrl: '/image' }]);
  await assert.rejects(uploadTempFiles([new File(['image'], 'test.png')]), /번호와 주소/);
});

test('lost responses keep the same key; a confirmed new execution gets a new key', async () => {
  const keys = [];
  let loseResponse = true;
  api.defaults.adapter = async (config) => {
    keys.push(config.headers.get('Idempotency-Key'));
    if (loseResponse) throw new AxiosError('offline', 'ERR_NETWORK', config);
    return response(config, { jobId: 71, type: 'TRAINING', status: 'PENDING' });
  };
  const submit = () => useJobStore.getState().createJob(1, 'TRAINING', { dataset_id: 4 });
  await assert.rejects(submit());
  assert.equal(keys.length, 1, 'POST is never automatically retried');
  loseResponse = false;
  await submit();
  await submit();
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[1], keys[2]);
});

test('503 and malformed responses resolve the original job without a new key', async () => {
  const keys = [];
  let attempt = 0;
  api.defaults.adapter = async (config) => {
    keys.push(config.headers.get('Idempotency-Key'));
    attempt++;
    if (attempt === 1) throw httpError(config, 503);
    if (attempt === 2) return response(config, { invalid: true });
    return response(config, { jobId: 72, type: 'INFERENCE', status: 'FAILED' });
  };
  const submit = () => useJobStore.getState().createJob(1, 'INFERENCE', { model_id: 2, fileIds: [101] });
  await assert.rejects(submit());
  await assert.rejects(submit());
  assert.equal((await submit()).jobId, '72');
  assert.equal(new Set(keys).size, 1);
});

test('status lookup preserves HTTP errors and distinguishes permanent failures', async () => {
  for (const status of [403, 404]) {
    const error = httpError({}, status);
    api.defaults.adapter = async () => { throw error; };
    await assert.rejects(useJobStore.getState().fetchJobStatus('404'), (received) => received === error);
    assert.equal(shouldRetryJobQuery(error), false);
  }
  assert.equal(shouldRetryJobQuery(httpError({}, 401)), false);
  assert.equal(shouldRetryJobQuery(new AxiosError('offline', 'ERR_NETWORK')), true);
  assert.equal(shouldRetryJobQuery(httpError({}, 503)), true);
});

test('server filters and cursors find older jobs and retain first-page counts on refresh', async () => {
  const calls = [];
  api.defaults.adapter = async (config) => {
    calls.push(config.params);
    return response(config, config.params.cursor
      ? { items: [{ jobId: 1, status: 'SUCCESS' }], hasNext: false, nextCursor: null, statusCounts: null }
      : { items: [{ jobId: 21, status: 'SUCCESS' }], hasNext: true, nextCursor: 'older', statusCounts: { SUCCESS: 21, RUNNING: 2 } });
  };
  const filters = { type: 'TRAINING', status: 'SUCCESS', keyword: 'Kim' };
  assert.equal((await fetchProjectJobPages('1', filters, 1)).hasNext, true);
  for (let refresh = 0; refresh < 2; refresh++) {
    const page = await fetchProjectJobPages('1', filters, 2);
    assert.deepEqual(page.items.map((item) => item.jobId), [21, 1]);
    assert.equal(page.statusCounts.RUNNING, 2);
    assert.equal(page.hasNext, false);
  }
  assert.deepEqual(calls[2], { ...filters, size: 20, cursor: 'older' });
});

test('inference metadata is restored by job and scoped to the logged-in user', () => {
  useAuthStore.setState({ user: { userId: 1 } });
  saveInferenceInputs('1', '71', [{ fileId: 101, fileUrl: 'https://example.com/secret-url', originalFileName: 'input.png' }]);
  assert.deepEqual(readInferenceInputs('1', '71'), [{ fileId: 101, originalFileName: 'input.png' }]);
  assert.equal([...sessionStorage.values.values()].some((value) => value.includes('secret-url')), false);
  useAuthStore.setState({ user: { userId: 2 } });
  assert.deepEqual(readInferenceInputs('1', '71'), []);
  assert.deepEqual(readInferenceInputs('1', '72'), []);
});

test('unfinished result screens hide metrics, completed titles and comments', () => {
  // React server rendering normally reads Zustand's original hydration snapshot.
  // Give each rendered case the same loaded job snapshot as the client screen.
  for (const status of ['PENDING', 'FAILED', 'CANCELLED']) {
    for (const [name, section, type] of [['AugmentResultPage', 'jobs', 'AUGMENTATION'], ['TrainResultPage', 'train', 'TRAINING'], ['InferenceResultPage', 'inference', 'INFERENCE']]) {
      useJobStore.setState({ currentJob: { jobId: '7', type, status, progress: 0, error: status === 'FAILED' ? '계산 실패' : null } });
      Object.assign(useJobStore.getInitialState(), useJobStore.getState());
      const html = renderToString(h(MemoryRouter, { initialEntries: [`/projects/1/${section}/7/result`] },
        h(Routes, null, h(Route, { path: '/projects/:projectId/' + section + '/:jobId/result', element: h(workflow[name]) }))));
      assert.doesNotMatch(html, /완료 리포트|팀 코멘트|평균 예측 신뢰도|생성된 이미지 수|Accuracy \(정확도\)/);
      if (status === 'FAILED') assert.match(html, /계산 실패/);
    }
  }
});
