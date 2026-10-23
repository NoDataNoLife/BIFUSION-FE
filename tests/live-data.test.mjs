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
  export { useAuthStore } from './src/store/useAuthStore';
  export { MemoryRouter } from 'react-router-dom';
  export { default as RecruitmentDetail } from './src/components/dashboard/RecruitmentDetail';
  export { default as QnaDetail } from './src/components/dashboard/QnaDetail';
  export { default as ExpertPage } from './src/pages/dashboard/ExpertPage';
  export { notificationTarget } from './src/lib/notificationTarget';
  export { formatBytes, requestMessage } from './src/lib/liveData';
  export { activityVisible, usagePercent, requestInspection, cancelInspection } from './src/lib/backendContracts';
  export { ResourceUsageSummary } from './src/components/dashboard/ResourceUsageCards';
  export { AugmentedInspectionCard } from './src/components/dashboard/AugmentedAssetsView';
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
  const html = renderExpert('APPROVED');
  const visible = html.replace(/<[^>]*>/g, '');
  assert.doesNotMatch(visible, /12,500|상위 5%|4\.9/);
  assert.match(visible, /평가 없음/);
});

function renderExpert(status) {
  const initial = app.useAuthStore.getInitialState();
  const previous = initial.user;
  initial.user = { userId: 1, expertStatus: status, isExpert: true };
  try {
    return app.renderToString(app.createElement(app.MemoryRouter, {}, app.createElement(app.ExpertPage)));
  } finally { initial.user = previous; }
}

test('uncertified experts see an application gate rather than protected tasks or HTTP errors', () => {
  const initial = app.useExpertStore.getInitialState();
  const previous = { error: initial.error, groupedTasks: initial.groupedTasks };
  initial.error = 'Request failed with status code 403';
  initial.groupedTasks = { PENDING: [{ reviewCode: 'PRIVATE', requester: { nickname: '비공개 요청자' }, projectName: '보호할 프로젝트', status: 'PENDING' }], IN_PROGRESS: [], COMPLETED: [] };
  try {
    const html = renderExpert('NONE');
    assert.match(html, /전문가로 함께해 주세요/);
    assert.match(html, /href="\/dashboard\/profile\?settings=verification"/);
    assert.match(html, /aria-hidden="true" inert=""/);
    assert.doesNotMatch(html, /비공개 요청자|보호할 프로젝트|403|검수 시작하기/);
  } finally { Object.assign(initial, previous); }
});

test('pending and rejected applications have distinct guidance even with a stale expert flag', () => {
  const pending = renderExpert('PENDING');
  assert.match(pending, /전문가 인증 심사 중입니다/);
  assert.match(pending, /신청 상태 확인하기/);
  assert.doesNotMatch(pending, /검수 시작하기/);
  const rejected = renderExpert('REJECTED');
  assert.match(rejected, /인증 서류를 다시 확인해 주세요/);
  assert.match(rejected, /서류 확인하고 다시 신청하기/);
});


test('resource limits keep unknown values separate from real zero usage', () => {
  const data = { storageUsedBytes: 0, storageLimitBytes: null, storageUnmeasuredFileCount: 2,
    monthlyAugmentations: null, monthlyAugmentationLimit: null, periodStart: null, periodEnd: null, timezone: 'Asia/Seoul' };
  const html = app.renderToString(app.createElement(app.ResourceUsageSummary, { data, loading: false, error: null, onRetry() {} }));
  assert.match(html, /0 B/);
  assert.match(html, /집계하지 못했습니다/);
  assert.match(html, /크기 미확인 파일/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.equal(app.usagePercent(0, 100), 0);
  assert.equal(app.usagePercent(200, 100), 100);
  assert.equal(app.usagePercent(null, 100), null);
  assert.equal(app.usagePercent(20, null), null);
});

test('profile visibility respects both content privacy and saved profile setting', () => {
  assert.equal(app.activityVisible({ isPublic: true, isMyPageVisible: false }), false);
  assert.equal(app.activityVisible({ isPublic: false, isMyPageVisible: true }), false);
  assert.equal(app.activityVisible({ isPublic: true, isMyPageVisible: true }), true);
});

test('inspection submits target ID and cancels request ID, not dataset or assignment ID', async () => {
  const calls = [];
  api.defaults.adapter = async config => { calls.push(config); return response(config, { inspectionRequestId: 45, status: 'PENDING' }); };
  const result = await app.requestInspection({ targetType: 'AUGMENTED_DATA', targetId: 123, canRequest: true }, '검수 요청', 500);
  assert.equal(result.inspectionRequestId, 45);
  assert.deepEqual(JSON.parse(calls[0].data), { targetType: 'AUGMENTED_DATA', targetId: 123, reason: '검수 요청', rewardPoints: 500 });
  await app.cancelInspection(result.inspectionRequestId);
  assert.equal(calls[1].url, '/inspections/requests/45/cancel');
  assert.equal(calls[1].method, 'patch');
  await assert.rejects(app.requestInspection({ targetType: 'AUGMENTED_DATA', targetId: 123, canRequest: false }, '메모', 500));
  assert.equal(calls.length, 2);
});

test('inspection card links dataset job result but keeps permission and target IDs separate', () => {
  const item = { datasetId: 9, jobCode: 'JOB-009', totalSampleCount: 30, generatedCount: 10,
    previewUrl: null, inspectionTarget: { targetType: 'AUGMENTED_DATA', targetId: 123, canRequest: false,
    inspectionRequestId: 45, status: 'PENDING', result: null } };
  const html = app.renderToString(app.createElement(app.MemoryRouter, {}, app.createElement(app.AugmentedInspectionCard, { item, projectId: 2, onRefresh() {} })));
  assert.match(html, /projects\/2\/jobs\/9\/result/);
  assert.match(html, /검수 신청 취소/);
  assert.doesNotMatch(html, />전문가 검수 신청</);
});
