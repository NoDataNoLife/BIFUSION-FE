import { useEffect, useState } from 'react';
import { isCancel } from 'axios';
import { estimateJobCost } from '../lib/jobEstimate';
export type { JobEstimate } from '../lib/jobEstimate';
import type { JobEstimate } from '../lib/jobEstimate';
import { requestMessage } from '../lib/liveData';
export function useJobEstimate(payload: Record<string, unknown> | null) {
  const key = JSON.stringify(payload);
  const [result, setResult] = useState<{ key: string; data: JobEstimate | null; error: string | null } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setResult(null);
    if (!payload) return;
    const timer = setTimeout(() => {
      estimateJobCost(JSON.parse(key), controller.signal).then(data => {
        if (!controller.signal.aborted) setResult({ key, data, error: null });
      }).catch(err => { if (!controller.signal.aborted && !isCancel(err)) setResult({ key, data: null, error: requestMessage(err) }); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key, version]);
  const current = result?.key === key ? result : null;
  return { data: current?.data ?? null, error: current?.error ?? null, loading: !!payload && !current, reload: () => setVersion(v => v + 1) };
}
