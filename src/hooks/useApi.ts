import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type ApiFunction<T, P> = (params: P) => Promise<T>;

export function useApi<T, P = any>(apiFunction: ApiFunction<T, P>) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(
    async (params: P) => {
      try {
        setState({ data: null, loading: true, error: null });
        const data = await apiFunction(params);
        setState({ data, loading: false, error: null });
        return { data, error: null };
      } catch (error) {
        const errorMessage = 
          error instanceof Error 
            ? error.message 
            : 'An unknown error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        return { data: null, error: errorMessage };
      }
    },
    [apiFunction]
  );

  return {
    ...state,
    execute
  };
}

export default useApi;