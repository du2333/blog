import { useMutation } from "@tanstack/react-query";
import { testAiConnectionFn } from "@/features/ai/ai.api";

export function useAiConnection() {
  const mutation = useMutation({
    mutationFn: testAiConnectionFn,
  });

  return {
    testAiConnection: mutation.mutateAsync,
  };
}
