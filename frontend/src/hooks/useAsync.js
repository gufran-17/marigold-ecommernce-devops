import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function on mount / when deps change. Returns { data, loading, error, reload, setData }.
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const counter = useRef(0);

  const run = useCallback(() => {
    counter.current += 1;
    const mine = counter.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    return fnRef.current()
      .then((data) => { if (mine === counter.current) setState({ data, loading: false, error: null }); })
      .catch((error) => { if (mine === counter.current) setState({ data: null, loading: false, error }); });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload: run, setData };
}
