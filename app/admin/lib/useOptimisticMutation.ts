'use client';

import { useCallback, useState } from 'react';

interface OptimisticMutationParams<T> {
  applyOptimistic: () => void;
  rollback: () => void;
  request: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

export function useOptimisticMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async <T,>({
    applyOptimistic,
    rollback,
    request,
    onSuccess,
    onError,
  }: OptimisticMutationParams<T>): Promise<T | undefined> => {
    applyOptimistic();
    setIsPending(true);

    try {
      const result = await request();
      onSuccess?.(result);
      return result;
    } catch (error) {
      rollback();
      onError?.(error);
      return undefined;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}
