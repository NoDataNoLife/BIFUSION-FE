export function inspectionUnavailable(status?: number, code?: string | null) {
  return status === 404 || code === 'IS009';
}
