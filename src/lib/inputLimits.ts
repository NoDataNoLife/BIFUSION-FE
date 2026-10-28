type Rule = Record<string, number>;
const titleBody: Rule = { title: 100, description: 2000, content: 2000 };

/** Matches saved text endpoints only. Does not mutate existing values. */
export function validateTextRequest(method: string | undefined, path: string | undefined, data: unknown) {
  if (!['post', 'put', 'patch'].includes((method ?? '').toLowerCase()) || !data || typeof data !== 'object' || Array.isArray(data)) return;
  const url = (path ?? '').split('?')[0];
  let limits: Rule | undefined;
  if (/^\/projects(?:\/\d+)?$/.test(url)) limits = { title: 100, description: 2000 };
  else if (/^\/projects\/\d+\/invitations$/.test(url)) limits = { email: 255 };
  else if (/^\/datasets(?:\/\d+(?:\/upload)?)?$/.test(url)) limits = { ...titleBody, category: 50, license: 50, format: 20, imageType: 50, resolution: 50, classes: 2000, usageExample: 2000, tags: 50 };
  else if (/^\/community\/recipes$/.test(url)) limits = { ...titleBody, modelName: 100, sampler: 50, resolution: 20, overview: 2000, features: 200, recommendations: 200 };
  else if (/^\/community\/recipes\/\d+\/reviews(?:\/\d+)?$/.test(url)) limits = { content: 2000 };
  else if (/^\/community\/qna(?:\/\d+)?(?:\/answers(?:\/\d+)?)?$/.test(url)) limits = { title: 100, content: 2000, tags: 50 };
  else if (/^\/community\/recruitments(?:\/\d+)?$/.test(url)) limits = { jobTitle: 100, organization: 255, description: 2000, requirements: 255, responsibilities: 255, benefits: 255, tags: 50 };
  else if (/^\/community\/recruitments\/\d+\/apply$/.test(url)) limits = { fullName: 255, email: 255, resumeUrl: 255, motivation: 2000 };
  else if (url === '/onboarding' || /^\/profile\/(nickname|introduction|location|website)$/.test(url) || /^\/users\/me\/(nickname|bio|location|organization|website)$/.test(url)) limits = { nickname: 255, bio: 2000, location: 255, organization: 255, websiteUrl: 255, contact: 20 };
  else if (/^\/inspections(?:\/.*)?$/.test(url)) limits = { reason: 2000, comment: 2000, draftComment: 2000, finalComment: 2000, rejectionReason: 2000, expertComment: 2000 };
  if (!limits) return;
  const body = data as Record<string, unknown>;
  const labels: Record<string, string> = { title: '제목', jobTitle: '포지션 제목', description: '설명', content: '내용', tags: '태그', modelName: '모델명', sampler: '샘플러', resolution: '해상도', overview: '본문', features: '핵심 특징', recommendations: '사용 사례', nickname: '닉네임', bio: '소개', email: '이메일', contact: '연락처' };
  for (const [field, max] of Object.entries(limits)) {
    const values = Array.isArray(body[field]) ? body[field] as unknown[] : [body[field]];
    if (values.some(value => typeof value === 'string' && value.length > max)) throw new Error(`${labels[field] ?? '입력 항목'}은 ${max.toLocaleString()}자 이하로 입력해 주세요. 기존 내용은 보존되어 있습니다.`);
  }
  if (url === '/community/recipes') for (const field of ['features', 'recommendations']) {
    if (Array.isArray(body[field]) && body[field].length > 20) throw new Error(`${labels[field]}은 20개 이하로 입력해 주세요.`);
  }
}
