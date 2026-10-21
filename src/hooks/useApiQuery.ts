import { useCallback, useEffect, useRef, useState } from 'react';
import { isCancel } from 'axios';
import api from '../lib/axios';
import { requestMessage } from '../lib/liveData';

export function useApiQuery<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const parameters = JSON.stringify(params ?? {});
  const request = useRef(0);
  useEffect(() => {
    const generation = ++request.current;
    const controller = new AbortController();
    setLoading(true); setData(null); setError(null);
    api.get(path, { params: JSON.parse(parameters), signal: controller.signal })
      .then((response) => {
        if (generation !== request.current || controller.signal.aborted) return;
        if (response.data?.success === false) throw new Error(response.data.message || '요청을 처리하지 못했습니다.');
        setData(response.data?.data ?? response.data);
      })
      .catch((err) => {
        if (!isCancel(err) && generation === request.current) setError(requestMessage(err));
      })
      .finally(() => { if (generation === request.current && !controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, parameters, version]);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { data, error, loading, reload };
}
