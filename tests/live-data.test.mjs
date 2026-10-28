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
  export { respondToInvitation } from './src/lib/teamInvitation';
  export { jobDelay } from './src/lib/jobDelay';
  export { kstDate } from './src/lib/kstDate';
  export { estimateJobCost } from './src/lib/jobEstimate';
  export { submitJobRequest, submitJobRetry } from './src/lib/jobSubmission';
  export { default as TeamInvitationActions } from './src/components/common/TeamInvitationActions';
  export { default as JobCostNotice } from './src/components/jobs/JobCostNotice';
  export { readAugmentationSettings, draftFromSettings, settingsFromDraft, augmentationJobParameters, augmentationRecipePayload } from './src/lib/augmentationRecipe';
  export { default as AugmentationRecipeForm } from './src/components/community/forms/AugmentationRecipeForm';
  export { default as RecipeAugmentationSettings } from './src/components/community/RecipeAugmentationSettings';
  export { validateTextRequest } from './src/lib/inputLimits';
  export { LimitedInput, LimitedTextarea } from './src/components/common/LimitedTextField';
  export { default as api } from './src/lib/axios';
  export { forkRecipe, createQuestion, deleteDatasetWithRefund, refreshCurrentPoints } from './src/lib/pointActions';
  export { inspectionUnavailable } from './src/lib/inspectionErrors';
  export { AntCostNotice, AntRequestError } from './src/components/common/AntActionNotice';
  export { recipeReviewPayload } from './src/lib/recipeReviewPayload';
  export { newRecipeDraft, draftFromRecipe, recipeRegistrationPayload } from './src/lib/recipeDraft';
  export { AxiosError } from 'axios';
  export { useNotificationStore } from './src/store/useNotificationStore';
  export { useProjectStore } from './src/store/useProjectStore';
  export { useAssetStore } from './src/store/useAssetStore';
  export { useExpertStore } from './src/store/useExpertStore';
  export { useCommunityStore } from './src/store/useCommunityStore';
  export { useAuthStore } from './src/store/useAuthStore';
  export { MemoryRouter } from 'react-router-dom';
  export { default as RecruitmentDetail } from './src/components/dashboard/RecruitmentDetail';
  export { default as QnaDetail } from './src/components/dashboard/QnaDetail';
  export { default as ReviewDetailPage } from './src/components/dashboard/ReviewDetailPage';
  export { default as ExpertPage } from './src/pages/dashboard/ExpertPage';
  export { notificationTarget } from './src/lib/notificationTarget';
  export { formatBytes, requestMessage } from './src/lib/liveData';
  export { activityVisible, usagePercent, requestInspection, cancelInspection } from './src/lib/backendContracts';
  export { ResourceUsageSummary } from './src/components/dashboard/ResourceUsageCards';
  export { AugmentedInspectionCard } from './src/components/dashboard/AugmentedAssetsView';
  export { default as VerificationResultModal } from './src/components/community/modals/VerificationResultModal';
  export { renderToString } from 'react-dom/server';
  export { createElement } from 'react';
` }, outfile, bundle: true, platform: 'node', packages: 'external', format: 'cjs', jsx: 'automatic', define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: "", VITE_INVITATION_ROLES_ENABLED: "false", VITE_COMMENT_ONLY_REVIEWS_ENABLED: "false" }) } });
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
  assert.doesNotMatch(html, /월간 증강/);
  const unknown = app.renderToString(app.createElement(app.ResourceUsageSummary, { data: { ...data, storageUsedBytes: null }, loading: false, error: null, onRetry() {} }));
  assert.match(unknown, /집계하지 못했습니다/);
  assert.doesNotMatch(unknown, /0 B/);
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


test('project changes update matching cards without modifying another open project', async () => {
  const projects = app.useProjectStore;
  projects.setState({
    currentProject: { projectId: 2, title: 'Other', bannerImageUrl: 'other.png', members: [] },
    managingProjects: [{ projectId: 1, title: 'Old', bannerImageUrl: 'old.png', members: [] }],
    participatingProjects: [{ projectId: 2, title: 'Other', bannerImageUrl: 'other.png', members: [] }],
  });
  api.defaults.adapter = async config => {
    assert.deepEqual(JSON.parse(config.data), { title: 'Updated', description: 'Saved' });
    return response(config, {});
  };
  assert.equal(await projects.getState().updateProjectInfo('1', { title: 'Updated', description: 'Saved', bannerImageUrl: 'new.png' }), true);
  assert.equal(projects.getState().managingProjects[0].bannerImageUrl, 'old.png');
  assert.equal(projects.getState().currentProject.title, 'Other');
  assert.equal(projects.getState().participatingProjects[0].bannerImageUrl, 'other.png');
  api.defaults.adapter = async config => ({ ...response(config, null), data: { success: false } });
  assert.equal(await projects.getState().updateProjectInfo('1', { title: 'Rejected' }), false);
  assert.equal(projects.getState().isLoading, false);
  assert.equal(projects.getState().managingProjects[0].title, 'Updated');
});


test('popup and history keep separate results even when requests finish in reverse order', async () => {
  let releaseHistory;
  api.defaults.adapter = async config => {
    if (config.params?.isRead === false) return response(config, { content: [], totalElements: 1 });
    if (config.url === '/notifications') return new Promise(resolve => { releaseHistory = () => resolve(response(config, { content: [{ notificationId: 501 }], totalElements: 1, totalPages: 1, pageNumber: 0 })); });
    return response(config, { content: [{ notificationId: 502 }], totalElements: 1 });
  };
  const history = notifications.getState().fetchNotifications();
  await notifications.getState().fetchPopupNotifications();
  releaseHistory();
  await history;
  assert.equal(notifications.getState().notifications[0].notificationId, 501);
  assert.equal(notifications.getState().popupNotifications[0].notificationId, 502);
});

test('popup falls back only when the new route is not deployed', async () => {
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    if (config.url === '/notifications/popup') throw new AxiosError('missing', 'ERR_BAD_REQUEST', config, null, { status: 404, data: {}, config, headers: {} });
    return response(config, { content: [{ notificationId: 503 }], totalElements: 1 });
  };
  await notifications.getState().fetchPopupNotifications();
  assert.equal(notifications.getState().popupNotifications[0].notificationId, 503);
  assert.ok(calls.includes('/notifications'));
  calls.length = 0;
  api.defaults.adapter = async config => { calls.push(config.url); throw failure(config); };
  await notifications.getState().fetchPopupNotifications();
  assert.ok(calls.every(url => url === '/notifications/popup'));
  assert.equal(notifications.getState().popupError, '서버 오류');
});

test('soft delete hides the popup item while preserving the full history item', async () => {
  let hidden = false;
  api.defaults.adapter = async config => {
    if (config.method === 'delete') { hidden = true; return response(config, null); }
    const content = config.url === '/notifications/popup' && hidden ? [] : [{ notificationId: 504 }];
    return response(config, { content, totalElements: content.length, totalPages: 1, pageNumber: 0 });
  };
  await notifications.getState().fetchNotifications();
  await notifications.getState().fetchPopupNotifications();
  assert.equal(await notifications.getState().softDeleteNotification(504), true);
  assert.equal(notifications.getState().notifications[0].notificationId, 504);
  assert.deepEqual(notifications.getState().popupNotifications, []);
  assert.equal(notifications.getState().unreadCount, 0);
});


test('invitations send MEMBER by default and the selected MANAGER role', async () => {
  const calls = [];
  api.defaults.adapter = async config => { calls.push(config); return response(config, {}); };
  assert.equal(await app.useProjectStore.getState().inviteMember('12', 'member@example.com'), true);
  assert.deepEqual(JSON.parse(calls[0].data), { email: 'member@example.com', role: 'MEMBER' });
  assert.equal(await app.useProjectStore.getState().inviteMember('12', 'manager@example.com', 'MANAGER'), true);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[1].data), { email: 'manager@example.com', role: 'MANAGER' });
});


test('comment-only requests omit scores and retain reply relationships', () => {
  assert.deepEqual(app.recipeReviewPayload(' 의견 ', true, 5), { content: '의견' });
  assert.deepEqual(app.recipeReviewPayload(' 답글 ', true, 0, 12), { content: '답글', parentReviewId: 12 });
  assert.deepEqual(app.recipeReviewPayload(' 수정 ', false, 3), { content: '수정', rating: 3 });
  assert.throws(() => app.recipeReviewPayload(' ', true, 5));
  assert.throws(() => app.recipeReviewPayload('의견', false, 0));
});


test('hidden unread history does not create a popup notification badge', async () => {
  api.defaults.adapter = async config => response(config, { content: [], totalElements: config.url === '/notifications' ? 7 : 0, totalPages: 1, pageNumber: 0 });
  await notifications.getState().fetchNotifications();
  assert.equal(notifications.getState().historyUnreadCount, 7);
  assert.equal(notifications.getState().unreadCount, 0);
});


test('manager role rollout enables explicit MANAGER requests without changing MEMBER defaults', async () => {
  const enabledFile = resolve(directory, 'enabled.cjs');
  await build({ stdin: { resolveDir: process.cwd(), loader: 'ts', contents: `
    export { respondToInvitation } from './src/lib/teamInvitation';
  export { jobDelay } from './src/lib/jobDelay';
  export { kstDate } from './src/lib/kstDate';
  export { estimateJobCost } from './src/lib/jobEstimate';
  export { submitJobRequest, submitJobRetry } from './src/lib/jobSubmission';
  export { default as TeamInvitationActions } from './src/components/common/TeamInvitationActions';
  export { default as JobCostNotice } from './src/components/jobs/JobCostNotice';
  export { readAugmentationSettings, draftFromSettings, settingsFromDraft, augmentationJobParameters, augmentationRecipePayload } from './src/lib/augmentationRecipe';
  export { default as AugmentationRecipeForm } from './src/components/community/forms/AugmentationRecipeForm';
  export { default as RecipeAugmentationSettings } from './src/components/community/RecipeAugmentationSettings';
  export { validateTextRequest } from './src/lib/inputLimits';
  export { LimitedInput, LimitedTextarea } from './src/components/common/LimitedTextField';
  export { default as api } from './src/lib/axios';
    export { useProjectStore } from './src/store/useProjectStore';
    export { invitationRolesEnabled, commentOnlyReviewsEnabled } from './src/lib/backendFeatures';
  ` }, outfile: enabledFile, bundle: true, platform: 'node', packages: 'external', format: 'cjs', define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: '', VITE_INVITATION_ROLES_ENABLED: 'true', VITE_COMMENT_ONLY_REVIEWS_ENABLED: 'true' }) } });
  const { default: enabled } = await import(pathToFileURL(enabledFile));
  assert.equal(enabled.invitationRolesEnabled, true);
  assert.equal(enabled.commentOnlyReviewsEnabled, true);
  const roles = [];
  enabled.api.defaults.adapter = async config => { roles.push(JSON.parse(config.data).role); return response(config, {}); };
  assert.equal(await enabled.useProjectStore.getState().inviteMember('12', 'manager@example.com', 'MANAGER'), true);
  assert.equal(await enabled.useProjectStore.getState().inviteMember('12', 'member@example.com'), true);
  assert.deepEqual(roles, ['MANAGER', 'MEMBER']);
});


test('imported recipe settings preserve zero, custom choices and batch size without importing ownership', () => {
  const source = { recipeId: 88, title: '원본', description: '설명', author: { userId: 99 }, isExpertVerified: true,
    overview: { content: '본문', features: ['특징'], recommendations: ['활용'] },
    settings: { model: 'model-custom', steps: 250, sampler: 'custom-sampler', cfgScale: 0, seed: '0', resolution: '640x480', batchSize: 12 } };
  const draft = app.draftFromRecipe(source);
  assert.equal(draft.cfgScale, '0');
  assert.equal(draft.seed, '0');
  assert.equal(draft.sampler, 'custom-sampler');
  assert.equal(draft.resolution, '640x480');
  const payload = app.recipeRegistrationPayload(draft, false);
  assert.equal(payload.batchSize, 12);
  assert.equal(payload.steps, 250);
  assert.equal(payload.seed, 0);
  assert.equal(payload.isPublic, false);
  assert.equal('forkedFromId' in payload, false);
  assert.equal('author' in payload, false);
  assert.equal('isExpertVerified' in payload, false);
  draft.features.push('새 특징');
  assert.deepEqual(source.overview.features, ['특징']);
});

test('missing source parameters remain empty and cannot silently become zero or defaults', () => {
  const draft = app.draftFromRecipe({ title: '제목', description: '설명', settings: null, overview: null });
  assert.equal(draft.steps, '');
  assert.equal(draft.seed, '');
  assert.equal(draft.modelName, '');
  assert.deepEqual(draft.features, []);
  assert.throws(() => app.recipeRegistrationPayload(draft, false));
  assert.throws(() => app.draftFromRecipe({ isDeleted: true }));
});

test('new recipe registration rejects invalid numeric input and honors explicit publication context', () => {
  const draft = { ...app.newRecipeDraft(), title: '새 레시피', description: '설명' };
  assert.equal(app.recipeRegistrationPayload(draft, true).isPublic, true);
  assert.equal(app.recipeRegistrationPayload(draft, false).isPublic, false);
  for (const invalid of [{ steps: '' }, { steps: '1.2' }, { batchSize: '0' }, { seed: '2147483648' }, { cfgScale: 'NaN' }]) {
    assert.throws(() => app.recipeRegistrationPayload({ ...draft, ...invalid }, false));
  }
});


test('invitation response uses both nested IDs and rejects processed or invalid invitations', async () => {
  const calls = [];
  api.defaults.adapter = async config => { calls.push(config); return response(config, {}); };
  const invitation = { projectId: 5, invitationId: 34, status: 'PENDING', role: 'MEMBER' };
  await app.respondToInvitation(invitation, 'ACCEPT');
  assert.equal(calls[0].url, '/projects/5/invitations/34');
  assert.deepEqual(JSON.parse(calls[0].data), { action: 'ACCEPT' });
  await app.respondToInvitation(invitation, 'REJECT');
  assert.deepEqual(JSON.parse(calls[1].data), { action: 'REJECT' });
  for (const status of ['ACCEPTED','REJECTED','EXPIRED']) await assert.rejects(app.respondToInvitation({ ...invitation, status }, 'ACCEPT'));
  await assert.rejects(app.respondToInvitation({ ...invitation, invitationId: 0 }, 'ACCEPT'));
  assert.equal(calls.length, 2);
});

test('pending invitation buttons, accepted link and legacy invitation guidance reflect server state', () => {
  const html = invitation => app.renderToString(app.createElement(app.MemoryRouter, {}, app.createElement(app.TeamInvitationActions, { invitation })));
  const pending = html({ projectId: 5, invitationId: 34, status: 'PENDING', role: 'MANAGER' });
  assert.match(pending, /수락/); assert.match(pending, /거절/); assert.doesNotMatch(pending, / disabled=""/);
  const accepted = html({ projectId: 5, invitationId: 34, status: 'ACCEPTED', role: 'MEMBER' });
  assert.match(accepted, /href="\/dashboard\/projects\/5"/); assert.doesNotMatch(accepted, />거절</);
  assert.match(html(null), /재발송/);
});

test('notification history reads the server page field', async () => {
  api.defaults.adapter = async config => response(config, { content: [], page: 3, totalPages: 5, totalElements: 41 });
  await notifications.getState().fetchNotifications({ page: 3 });
  assert.equal(notifications.getState().currentPage, 3);
});

test('recipe and original dataset inspections keep server target IDs and validate reward bounds', async () => {
  const calls = [];
  api.defaults.adapter = async config => { calls.push(config); return response(config, {}); };
  for (const targetType of ['RECIPE','UPLOADED_DATA']) {
    await app.requestInspection({ targetType, targetId: 12, canRequest: true, minRewardPoints: 500, maxRewardPoints: 3000 }, '메모', 501);
    assert.deepEqual(JSON.parse(calls.at(-1).data), { targetType, targetId: 12, reason: '메모', rewardPoints: 501 });
    await assert.rejects(app.requestInspection({ targetType, targetId: 12, canRequest: true, minRewardPoints: 500, maxRewardPoints: 3000 }, '메모', 499));
  }
  assert.equal(calls.length, 2);
});

test('delay warnings use KST timestamps and stop for terminal jobs', () => {
  const now = Date.parse('2026-10-27T03:01:00Z');
  assert.equal(app.kstDate('2026-10-27T12:00:00').getTime(), Date.parse('2026-10-27T03:00:00Z'));
  assert.equal(app.jobDelay({ status: 'PENDING', startedAt: '2026-10-27T12:00:01' }, now), null);
  assert.match(app.jobDelay({ status: 'PENDING', startedAt: '2026-10-27T12:00:00' }, now), /대기/);
  assert.match(app.jobDelay({ status: 'RUNNING', mlUnreachableSince: '2026-10-27T12:00:00' }, now), /연결/);
  assert.equal(app.jobDelay({ status: 'FAILED', mlUnreachableSince: '2026-10-27T12:00:00' }, now), null);
  assert.equal(app.jobDelay({ status: 'PENDING', startedAt: null }, now), null);
});

test('cost estimates preserve the execution payload and reject missing or malformed costs', async () => {
  let request;
  api.defaults.adapter = async config => { request = config; return response(config, { type: 'INFERENCE', cost: 6, currentPoints: 5, affordable: false }); };
  const payload = { type: 'INFERENCE', model_id: 7, fileIds: [40,41,42,43] };
  assert.equal((await app.estimateJobCost(payload)).affordable, false);
  assert.equal(request.url, '/jobs/cost-estimate'); assert.deepEqual(JSON.parse(request.data), payload);
  api.defaults.adapter = async config => response(config, { cost: null, affordable: true });
  await assert.rejects(app.estimateJobCost(payload));
});

test('known rejected executions use a fresh key while ambiguous 503 responses retain the original key', async () => {
  for (const [index, code] of ['ML001', 'ML006', undefined].entries()) {
    const keys = [];
    api.defaults.adapter = async config => {
      keys.push(config.headers.get('Idempotency-Key'));
      throw new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, { status: 503, data: { code }, config });
    };
    const submit = () => app.submitJobRequest(1, `estimate-${index}`, { type: 'AUGMENTATION' });
    await assert.rejects(submit()); await assert.rejects(submit());
    if (code) assert.notEqual(keys[0], keys[1]); else assert.equal(keys[0], keys[1]);
  }
});

test('retry requests have independent idempotency keys and retain unresolved requests', async () => {
  const calls = [];
  api.defaults.adapter = async config => { calls.push(config); throw new AxiosError('offline', 'ERR_NETWORK', config); };
  await assert.rejects(app.submitJobRetry(1, '34'));
  await assert.rejects(app.submitJobRetry(1, '34'));
  assert.equal(calls[0].url, '/jobs/34/retry');
  assert.equal(calls[0].headers.get('Idempotency-Key'), calls[1].headers.get('Idempotency-Key'));
});

test('project cover uses multipart PATCH and updates detail and list with the server URL', async () => {
  const store = app.useProjectStore;
  store.setState({ currentProject: { projectId: 7, title: 'project', bannerImageUrl: 'old', members: [] }, managingProjects: [{ projectId: 7, bannerImageUrl: 'old' }], participatingProjects: [] });
  api.defaults.adapter = async config => {
    assert.equal(config.method, 'patch');
    assert.equal(config.url, '/projects/7/banner');
    assert.ok(config.data instanceof FormData);
    assert.equal(config.data.get('file').name, 'cover.png');
    return response(config, { projectId: 7, bannerImageUrl: 'https://files.example/new.png' });
  };
  assert.equal(await store.getState().updateProjectBanner('7', new File(['image'], 'cover.png', { type: 'image/png' })), true);
  assert.equal(store.getState().currentProject.bannerImageUrl, 'https://files.example/new.png');
  assert.equal(store.getState().managingProjects[0].bannerImageUrl, 'https://files.example/new.png');
});

test('project cover removal sends no file and preserves the old cover on a failed request', async () => {
  const store = app.useProjectStore;
  api.defaults.adapter = async config => { throw failure(config); };
  assert.equal(await store.getState().updateProjectBanner('7', null), false);
  assert.equal(store.getState().currentProject.bannerImageUrl, 'https://files.example/new.png');
  api.defaults.adapter = async config => {
    assert.equal(config.data.has('file'), false);
    return response(config, { projectId: 7, bannerImageUrl: null });
  };
  assert.equal(await store.getState().updateProjectBanner('7', null), true);
  assert.equal(store.getState().currentProject.bannerImageUrl, null);
});

test('project creation sends invitations separately and reports cover failure without recreating the project', async () => {
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    if (config.url === '/projects') {
      assert.deepEqual(JSON.parse(config.data), { title: 'new', description: 'desc', isPublic: true });
      return response(config, { projectId: 19 });
    }
    if (config.url === '/projects/19/banner') throw failure(config);
    assert.equal(config.url, '/projects/19/invitations');
    assert.deepEqual(JSON.parse(config.data), { email: 'member@example.com', role: 'MEMBER' });
    return response(config, {});
  };
  assert.equal(await app.useProjectStore.getState().createProject({ name: 'new', description: 'desc', coverFile: new File(['image'], 'cover.png'), teamMembers: [{ email: 'member@example.com', role: 'MEMBER' }] }), true);
  assert.deepEqual(calls, ['/projects', '/projects/19/banner', '/projects/19/invitations']);
  assert.match(app.useProjectStore.getState().error, /프로젝트는 생성되었습니다/);
});


test('fork and question creation refresh the server balance without calculating points locally', async () => {
  const auth = app.useAuthStore;
  auth.setState({ user: { userId: 9, points: 500, nickname: 'user' }, isAuthenticated: true });
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    if (config.url === '/users/me') return response(config, { userId: 9, points: calls.length === 2 ? 470 : 370 });
    return response(config, { id: 11 });
  };
  assert.equal((await app.forkRecipe(7)).balanceRefreshed, true);
  assert.equal(auth.getState().user.points, 470);
  assert.equal((await app.createQuestion({ title: 'question', content: 'body', tags: [] })).balanceRefreshed, true);
  assert.equal(auth.getState().user.points, 370);
  assert.deepEqual(calls, ['/community/recipes/7/fork', '/users/me', '/community/qna', '/users/me']);
});

test('a rejected paid action leaves balance unchanged and never requests a successful balance refresh', async () => {
  app.useAuthStore.setState({ user: { userId: 9, points: 10 }, isAuthenticated: true });
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    throw new AxiosError('insufficient', 'ERR_BAD_REQUEST', config, null, { status: 400, data: { code: 'IS004' } });
  };
  await assert.rejects(app.forkRecipe(7));
  assert.deepEqual(calls, ['/community/recipes/7/fork']);
  assert.equal(app.useAuthStore.getState().user.points, 10);
});

test('successful dataset deletion stays successful when balance lookup fails and does not log out the user', async () => {
  app.useAuthStore.setState({ user: { userId: 9, points: 400 }, isAuthenticated: true });
  const calls = [];
  api.defaults.adapter = async config => {
    calls.push(config.url);
    if (config.url === '/users/me') throw failure(config);
    return response(config, {});
  };
  assert.equal((await app.deleteDatasetWithRefund(6)).balanceRefreshed, false);
  assert.deepEqual(calls, ['/datasets/6', '/users/me']);
  assert.equal(app.useAuthStore.getState().isAuthenticated, true);
  assert.equal(app.useAuthStore.getState().user.points, 400);
});

test('balance refresh does not apply a response after the signed-in account changes', async () => {
  app.useAuthStore.setState({ user: { userId: 9, points: 400 }, isAuthenticated: true });
  api.defaults.adapter = async config => {
    app.useAuthStore.setState({ user: { userId: 10, points: 1000 }, isAuthenticated: true });
    return response(config, { userId: 9, points: 470 });
  };
  assert.equal(await app.refreshCurrentPoints(), false);
  assert.equal(app.useAuthStore.getState().user.points, 1000);
});

test('paid action notices disclose cost and server IS004 provides a direct charge link', () => {
  app.useAuthStore.setState({ user: { userId: 9, points: 10 }, isAuthenticated: true });
  const wrap = child => app.renderToString(app.createElement(app.MemoryRouter, {}, child));
  const cost = wrap(app.createElement(app.AntCostNotice, { cost: 100, label: '질문 등록', points: 10 }));
  assert.match(cost, /100/);
  assert.match(cost, /보유 앤트가 부족/);
  assert.match(cost, /dashboard\/ants\/topup/);
  const error = new AxiosError('insufficient', 'ERR_BAD_REQUEST', {}, null, { status: 400, data: { code: 'IS004' } });
  const html = wrap(app.createElement(app.AntRequestError, { error }));
  assert.match(html, /앤트 충전하기/);
  assert.equal(wrap(app.createElement(app.AntRequestError, { error: null })), '');
});

test('missing inspection details return to the list but transient failures remain retryable', () => {
  assert.equal(app.inspectionUnavailable(404), true);
  assert.equal(app.inspectionUnavailable(400, 'IS009'), true);
  assert.equal(app.inspectionUnavailable(503), false);
  assert.equal(app.inspectionUnavailable(undefined), false);
});

test('expert task cards use server avatars or the shared default, never generated characters', () => {
  const initial = app.useExpertStore.getInitialState();
  const previous = initial.groupedTasks;
  const task = { reviewCode: 'REV-002', status: 'PENDING', requester: { nickname: '요청자', email: 'test@example.com' } };
  try {
    initial.groupedTasks = { PENDING: [task], IN_PROGRESS: [], COMPLETED: [] };
    assert.match(renderExpert('APPROVED'), /src="\/defaultUserProfile.png"/);
    task.requester.profileImageUrl = 'https://example.com/custom-profile.png';
    const html = renderExpert('APPROVED');
    assert.match(html, /src="https:\/\/example.com\/custom-profile.png"/);
    assert.doesNotMatch(html, /dicebear/);
  } finally { initial.groupedTasks = previous; }
});

test('inspection detail uses the detailed requester profile and nested request date', () => {
  const initial = app.useExpertStore.getInitialState();
  const previous = { inspectionDetail: initial.inspectionDetail, isLoadingDetail: initial.isLoadingDetail };
  const detail = { inspectionId: 2, targetType: 'RECIPE', requester: { name: '실제 요청자', email: 'actual@example.com', profileImageUrl: 'https://example.com/actual.png', requestedAt: '2026-10-28T12:00:00' } };
  const request = { id: 'REV-002', requester: { name: '목록 요청자', email: 'old@example.com', avatar: 'https://example.com/stale.png' }, parameters: {}, requestDate: '날짜 정보 없음' };
  const render = () => app.renderToString(app.createElement(app.ReviewDetailPage, { request, onBack() {}, onApprove() {}, onReject() {} }));
  try {
    Object.assign(initial, { inspectionDetail: detail, isLoadingDetail: false });
    const html = render();
    assert.match(html, /src="https:\/\/example.com\/actual.png"/);
    assert.match(html, /실제 요청자/);
    assert.match(html, /actual@example.com/);
    assert.doesNotMatch(html, /stale.png|날짜 정보 없음/);
    detail.requester.profileImageUrl = null;
    assert.match(render(), /src="\/defaultUserProfile.png"/);
  } finally { Object.assign(initial, previous); }
});
test('project deletion removes only the deleted project and preserves unrelated detail', async () => {
  const store = app.useProjectStore;
  store.setState({ managingProjects: [{ projectId: 1 }, { projectId: 2 }], participatingProjects: [{ projectId: 1 }], currentProject: { projectId: 2 } });
  api.defaults.adapter = async config => {
    assert.equal(config.method, 'delete');
    assert.equal(config.url, '/projects/1');
    return response(config, null);
  };
  assert.equal(await store.getState().deleteProject('1'), true);
  assert.deepEqual(store.getState().managingProjects, [{ projectId: 2 }]);
  assert.deepEqual(store.getState().participatingProjects, []);
  assert.equal(store.getState().currentProject.projectId, 2);
  assert.equal(await store.getState().deleteProject('1'), true);
});

test('project deletion rejection preserves data and explains active jobs, inspection or permissions', async () => {
  const store = app.useProjectStore;
  for (const [code, status, message] of [['P011', 409, /진행 중인 작업/], ['IS012', 409, /검수 중/], ['P002', 403, /관리자/], ['P001', 404, /존재하지/]]) {
    store.setState({ managingProjects: [{ projectId: 1 }], currentProject: { projectId: 1 } });
    api.defaults.adapter = async config => { throw new app.AxiosError('rejected', 'ERR_BAD_RESPONSE', config, null, { ...response(config, null), status, data: { code } }); };
    assert.equal(await store.getState().deleteProject('1'), false);
    assert.equal(store.getState().managingProjects.length, 1);
    assert.equal(store.getState().currentProject.projectId, 1);
    assert.match(store.getState().error, message);
  }
});

test('new training and inference notifications retain job routing and category filters', async () => {
  for (const type of ['TRAINING', 'INFERENCE']) {
    api.defaults.adapter = async config => {
      if (config.url === '/notifications') {
        assert.equal(config.params.category, type);
        return response(config, { content: [], page: 0, totalPages: 0, totalElements: 0 });
      }
      return response(config, { projectId: 2, jobId: 3, type, status: 'SUCCESS' });
    };
    await app.useNotificationStore.getState().fetchNotifications({ category: type });
    const target = await app.notificationTarget({ type: `${type}_SUCCESS`, targetType: 'JOB', targetId: 3 });
    assert.equal(target, `/dashboard/projects/2/${type === 'TRAINING' ? 'train' : 'inference'}/3/result`);
  }
  assert.equal(await app.notificationTarget({ type: 'RECIPE_REVIEW_REQUESTED', targetType: 'INSPECTION_REQUEST', targetId: 45 }), '/dashboard/expert');
});

test('text limits match endpoint exceptions and preserve imported data', () => {
  const body = { title: '가'.repeat(101), description: '기존 내용' };
  assert.throws(() => app.validateTextRequest('post', '/community/recipes', body), /100자/);
  assert.equal(body.title.length, 101);
  assert.equal(body.description, '기존 내용');
  assert.doesNotThrow(() => app.validateTextRequest('post', '/datasets', { title: '가'.repeat(100), format: 'a'.repeat(20) }));
  assert.throws(() => app.validateTextRequest('put', '/datasets/3/upload', { format: 'a'.repeat(21) }), /20자/);
  assert.throws(() => app.validateTextRequest('put', '/profile/introduction', { bio: 'a'.repeat(2001) }), /2,000자/);
  assert.throws(() => app.validateTextRequest('patch', '/inspections/3/approve', { expertComment: 'a'.repeat(2001) }), /2,000자/);
  assert.doesNotThrow(() => app.validateTextRequest('get', '/datasets', { title: 'a'.repeat(500) }));
  assert.doesNotThrow(() => app.validateTextRequest('post', '/jobs/cost-estimate', { type: 'TRAINING', epochs: 30 }));
});

test('tag and recipe feature limits validate individual entries and total feature count', () => {
  assert.throws(() => app.validateTextRequest('post', '/community/qna', { tags: ['a'.repeat(51)] }), /50자/);
  assert.doesNotThrow(() => app.validateTextRequest('post', '/community/recipes', { features: ['가'.repeat(200)] }));
  assert.throws(() => app.validateTextRequest('post', '/community/recipes', { features: ['가'.repeat(201)] }), /200자/);
  assert.throws(() => app.validateTextRequest('post', '/community/recipes', { recommendations: Array(21).fill('사례') }), /20개/);
});

test('length controls show accessible counts and retain over-limit existing values', () => {
  const html = app.renderToString(app.createElement(app.LimitedTextarea, { value: '가'.repeat(101), maxLength: 100, onChange() {}, 'aria-label': '제목' }));
  assert.match(html, /maxLength="100"|maxlength="100"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby=/);
  assert.match(html.replace(/<!--.*?-->/g, ''), /101 \/ 100자/);
  assert.match(html, new RegExp('가'.repeat(101)));
});

test('over-limit saves are rejected before reaching the network adapter', async () => {
  let calls = 0;
  api.defaults.adapter = async config => { calls++; return response(config, {}); };
  await assert.rejects(api.put('/profile/nickname', { nickname: 'a'.repeat(256) }), /255자/);
  assert.equal(calls, 0);
  await api.put('/profile/nickname', { nickname: 'a'.repeat(255) });
  assert.equal(calls, 1);
});


test('augmentation recipe settings round trip without losing actual seed or strength zero', () => {
  const settings = { numSamplesPerClass: 10, strength: 0, finetuneSteps: 400, steps: 50, seed: 0 };
  const copied = app.settingsFromDraft(app.draftFromSettings(settings));
  assert.deepEqual(copied, settings);
  assert.deepEqual(app.augmentationJobParameters(copied), { num_samples_per_class: 10, strength: 0, finetune_steps: 400, steps: 50, seed: 0 });
  assert.deepEqual(settings, { numSamplesPerClass: 10, strength: 0, finetuneSteps: 400, steps: 50, seed: 0 });
});

test('legacy and incomplete augmentation recipes cannot silently become runnable settings', () => {
  for (const value of [null, undefined, {}, { model: 'legacy', steps: 50, seed: 42 }, { numSamplesPerClass: 10, strength: 0.3, finetuneSteps: 400, steps: 50 }]) {
    assert.throws(() => app.readAugmentationSettings(value));
  }
  const base = { numSamplesPerClass: 10, strength: 0.3, finetuneSteps: 400, steps: 50, seed: 42 };
  for (const invalid of [{ numSamplesPerClass: 101 }, { strength: NaN }, { finetuneSteps: 0 }, { steps: 201 }, { seed: -1 }, { seed: 4294967296 }, { steps: '50' }]) assert.throws(() => app.readAugmentationSettings({ ...base, ...invalid }));
  assert.throws(() => app.settingsFromDraft({ ...app.draftFromSettings(base), strength: '' }));
});

test('job-backed recipe saves use sourceJobId exclusively while manual copies retain settings', () => {
  const settings = { numSamplesPerClass: 10, strength: 0.3, finetuneSteps: 400, steps: 50, seed: 42 };
  const meta = { title: ' 시험 ', description: ' 설명 ', overview: '' };
  const manual = app.augmentationRecipePayload(meta, settings, true);
  assert.deepEqual(manual.augmentationSettings, settings);
  assert.equal(manual.title, '시험');
  assert.equal(manual.isPublic, true);
  assert.equal('sourceJobId' in manual, false);
  assert.equal('modelName' in manual, false);
  assert.equal('forkedFromId' in manual, false);
  const fromJob = app.augmentationRecipePayload(meta, settings, false, 44);
  assert.equal(fromJob.sourceJobId, 44);
  assert.equal(fromJob.isPublic, false);
  assert.equal('augmentationSettings' in fromJob, false);
  assert.throws(() => app.augmentationRecipePayload(meta, settings, false, NaN));
});

test('new recipe settings render Korean labels and never invent a legacy configuration', () => {
  const render = value => app.renderToString(app.createElement(app.RecipeAugmentationSettings, { recipeId: 3, value }));
  const html = render({ numSamplesPerClass: 10, strength: 0.3, finetuneSteps: 400, steps: 50, seed: 42 });
  assert.match(html, /클래스별 생성 장수/);
  assert.match(html, /파인튜닝 스텝/);
  assert.doesNotMatch(html, /CFG|Euler/);
  assert.match(render(null), /설정 기록이 없습니다/);
});

test('job-backed recipe form cannot save before a real snapshot is loaded', () => {
  const html = app.renderToString(app.createElement(app.AugmentationRecipeForm, { context: 'ASSET', sourceJobId: 44, onClose() {} }));
  assert.match(html, /비공개로 저장/);
  assert.match(html, /파인튜닝 스텝/);
  assert.match(html, /disabled=""[^>]*>내 레시피로 저장/);
  assert.doesNotMatch(html, /Euler a|BIFUSION-Diffusion/);
});
