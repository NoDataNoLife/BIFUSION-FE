import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

class Storage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
globalThis.localStorage = new Storage();
globalThis.sessionStorage = new Storage();
await mkdir('node_modules/.tmp', { recursive: true });
const directory = await mkdtemp(resolve('node_modules/.tmp/live-tests-'));
after(() => rm(directory, { recursive: true, force: true }));
const outfile = resolve(directory, 'live.cjs');
await build({ stdin: { resolveDir: process.cwd(), loader: 'ts', contents: `
  export { default as api } from './src/lib/axios';
  export { AxiosError } from 'axios';
  export { useNotificationStore } from './src/store/useNotificationStore';
  export { useAssetStore } from './src/store/useAssetStore';
  export { useExpertStore } from './src/store/useExpertStore';
  export { useCommunityStore } from './src/store/useCommunityStore';
  export { default as RecruitmentDetail } from './src/components/dashboard/RecruitmentDetail';
  export { default as QnaDetail } from './src/components/dashboard/QnaDetail';
  export { default as ExpertPage } from './src/pages/dashboard/ExpertPage';
  export { notificationTarget } from './src/lib/notificationTarget';
  export { formatBytes, requestMessage } from './src/lib/liveData';
  export { default as VerificationResultModal } from './src/components/community/modals/VerificationResultModal';
  export { renderToString } from 'react-dom/server';
  export { createElement } from 'react';
` }, outfile, bundle: true, platform: 'node', packages: 'external', format: 'cjs', jsx: 'automatic', define: { 'import.meta.env.VITE_API_URL': "''" } });
const { default: app } = await import(pathToFileURL(outfile));
const { api, AxiosError, useNotificationStore: notifications, useAssetStore: assets, useExpertStore: expert } = app;
const response = (config, data) => ({ config, data: { success: true, data }, status: 200, statusText: 'OK', headers: {} });
const failure = (config) => new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, { status: 503, data: { message: '서버 오류' }, config, headers: {}, statusText: '' });

test('notification state begins empty and keeps server failures visible', async () => {
  assert.deepEqual(notifications.getState().notifications, []);
  api.defaults.adapter = async (config) => { throw failure(config); };
  await notifications.getState().fetchNotifications();
  assert.equal(notifications.getState().notifications.length, 0);
  assert.equal(notifications.getState().error, '서버 오류');
});

test('notifications use real pagination and global unread count', async () => {
  api.defaults.adapter = async (config) => response(config, config.params.isRead === false
    ? { content: [], totalElements: 17 }
    : { content: [{ notificationId: 31, isRead: false }], totalElements: 41, totalPages: 5, pageNumber: 2 });
  await notifications.getState().fetchNotifications({ page: 2 });
  assert.equal(notifications.getState().currentPage, 2);
  assert.equal(notifications.getState().unreadCount, 17);
  assert.equal(notifications.getState().notifications[0].notificationId, 31);
});

test('failed reads and deletions never report success or alter the displayed notification', async () => {
  notifications.setState({ notifications: [{ notificationId: 31, isRead: false }], unreadCount: 1 });
  api.defaults.adapter = async (config) => { throw failure(config); };
  assert.equal(await notifications.getState().markAsRead(31), false);
  assert.equal(notifications.getState().notifications[0].isRead, false);
  assert.equal(await notifications.getState().hardDeleteNotification(31), false);
  assert.equal(notifications.getState().notifications.length, 1);
});

test('successful notification deletion reloads server state', async () => {
  const calls = [];
  api.defaults.adapter = async (config) => { calls.push([config.method, config.url, config.params]); return response(config, { content: [], totalPages: 0, totalElements: 0, pageNumber: 0 }); };
  assert.equal(await notifications.getState().softDeleteNotification(31), true);
  assert.equal(calls[0][0], 'delete');
  assert.equal(calls[0][1], '/notifications/popup');
  assert.equal(calls[0][2].notificationId, 31);
  assert.deepEqual(notifications.getState().notifications, []);
});

test('asset endpoints retain BE field names and real zero values', async () => {
  api.defaults.adapter = async (config) => response(config, { content: config.url.includes('datasets')
    ? [{ datasetId: 4, name: '실제 데이터', totalSize: 0, fileCount: 0, fileFormats: [] }]
    : [{ recipeId: 5, title: '실제 레시피', rating: 0, viewCount: 0, expertVerified: false }] });
  await assets.getState().fetchMyDatasets('UPLOADED');
  assert.equal(assets.getState().myDatasets[0].name, '실제 데이터');
  assert.equal(assets.getState().myDatasets[0].fileCount, 0);
  await assets.getState().fetchMyRecipes('MY');
  assert.equal(assets.getState().myRecipes[0].rating, 0);
  api.defaults.adapter = async (config) => { throw failure(config); };
  await assets.getState().fetchMyRecipes('MY');
  assert.deepEqual(assets.getState().myRecipes, []);
});

test('expert approval and rejection use PATCH and expertComment; failures propagate', async () => {
  const calls = [];
  api.defaults.adapter = async (config) => { calls.push(config); return response(config, {}); };
  await expert.getState().approveInspection(7, '승인 의견');
  await expert.getState().rejectInspection(7, '거절 의견');
  assert.deepEqual(calls.map((config) => config.method), ['patch', 'patch']);
  assert.deepEqual(calls.map((config) => JSON.parse(config.data)), [{ expertComment: '승인 의견' }, { expertComment: '거절 의견' }]);
  api.defaults.adapter = async (config) => { throw failure(config); };
  await assert.rejects(expert.getState().approveInspection(7, '의견'));
});

test('job notifications resolve job ID to the actual project and workflow', async () => {
  api.defaults.adapter = async (config) => response(config, { jobId: 77, projectId: 9, type: 'TRAINING', status: 'SUCCESS' });
  assert.equal(await app.notificationTarget({ targetType: 'JOB', targetId: 77 }), '/dashboard/projects/9/train/77/result');
  assert.equal(await app.notificationTarget({ targetType: 'PROJECT', targetId: 3 }), '/dashboard/projects/3');
});

test('verification results render server values and never replace absent results with sample scores', () => {
  const empty = app.renderToString(app.createElement(app.VerificationResultModal, { onClose() {}, assetTitle: '대상' }));
  assert.doesNotMatch(empty.replace(/<[^>]*>/g, ''), /김의사|95|서울대학교병원/);
  assert.match(empty, /서버에서 검증 결과를 제공하지 않았습니다/);
  const actual = app.renderToString(app.createElement(app.VerificationResultModal, { onClose() {}, assetTitle: '대상', result: { reviewerName: '실제 검수자', score: 0, comment: '실제 의견', verifiedAt: null } }));
  assert.match(actual, /실제 검수자/);
  assert.match(actual, /실제 의견/);
  assert.doesNotMatch(actual, /미제공/);
});

test('unknown sizes stay unknown and zero byte files remain zero', () => {
  assert.equal(app.formatBytes(null), '정보 없음');
  assert.equal(app.formatBytes(0), '0 B');
  assert.equal(app.formatBytes(1024), '1.0 KB');
});

test('recruitment detail renders the flat applicant fields returned by BE', () => {
  const store = app.useCommunityStore;
  store.setState({ error: null, isLoadingDetail: false, recruitmentDetail: {
    recruitmentId: 2, jobTitle: '실제 모집글', organization: '기관', tags: [], deadline: null,
    description: '모집 설명', requirements: [], responsibilities: [], benefits: [],
    author: { userId: 1, nickname: '작성자' },
    applications: [{ applicationId: 3, userId: 4, nickname: '실제 지원자', profileImageUrl: null, status: 'PENDING' }],
  } });
  Object.assign(store.getInitialState(), store.getState());
  // The own-application lookup also runs for ordinary visitors; it must not dereference app.applicant.
  const html = app.renderToString(app.createElement(app.RecruitmentDetail, { recruitmentId: 2, onBack() {} }));
  assert.match(html, /실제 모집글/);
});

test('Q&A lookup errors show an error instead of an endless loading screen', () => {
  const store = app.useCommunityStore;
  store.setState({ qnaDetail: null, isLoadingDetail: false, error: '질문을 찾을 수 없습니다.' });
  Object.assign(store.getInitialState(), store.getState());
  const html = app.renderToString(app.createElement(app.QnaDetail, { qnaId: 5, onBack() {} }));
  assert.match(html, /질문을 찾을 수 없습니다/);
  assert.doesNotMatch(html, /불러오는 중/);
});

test('expert dashboard does not invent rewards, percentile or satisfaction', () => {
  const html = app.renderToString(app.createElement(app.ExpertPage));
  const visible = html.replace(/<[^>]*>/g, '');
  assert.doesNotMatch(visible, /12,500|상위 5%|4\.9/);
  assert.match(visible, /평가 없음/);
});
