import { useMutation } from "@tanstack/react-query";
import { testEmailConnectionFn } from "@/features/email/email.api";

export function useEmailConnection() {
  const mutation = useMutation({
    mutationFn: testEmailConnectionFn,
  });

  return {
    testEmailConnection: mutation.mutateAsync,
  };
}
