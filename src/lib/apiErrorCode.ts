export function apiErrorCode(error: unknown): string | undefined {
  const body = (error as { response?: { data?: { code?: string; errorCode?: string; error_code?: string } } })?.response?.data;
  return body?.code ?? body?.errorCode ?? body?.error_code;
}
