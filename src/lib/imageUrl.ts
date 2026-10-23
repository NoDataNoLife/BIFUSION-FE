export const safeEncodeUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('X-Amz-Signature')) return url;
  try {
    return encodeURI(decodeURI(url));
  } catch {
    try {
      return encodeURI(url);
    } catch {
      return url;
    }
  }
};
