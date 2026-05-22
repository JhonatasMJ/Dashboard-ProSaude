import { useCallback, useRef } from "react";

/** Evita que respostas antigas de fetch sobrescrevam dados mais recentes. */
export function useRequestGeneration() {
  const generationRef = useRef(0);

  const startRequest = useCallback(() => {
    generationRef.current += 1;
    return generationRef.current;
  }, []);

  const isStaleRequest = useCallback((requestId: number) => {
    return generationRef.current !== requestId;
  }, []);

  const invalidateRequests = useCallback(() => {
    generationRef.current += 1;
  }, []);

  return { startRequest, isStaleRequest, invalidateRequests };
}
