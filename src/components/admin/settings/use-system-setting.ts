import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSystemConfigFn,
  testAiConnectionFn,
  testEmailConnectionFn,
  updateSystemConfigFn,
} from "@/features/config/config.api";

export function useSystemSetting() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["systemConfig"],
    queryFn: getSystemConfigFn,
  });

  const saveMutation = useMutation({
    mutationFn: updateSystemConfigFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemConfig"] });
    },
  });

  const testAiConnectionMutation = useMutation({
    mutationFn: testAiConnectionFn,
  });

  const testEmailConnectionMutation = useMutation({
    mutationFn: testEmailConnectionFn,
  });

  return {
    settings: data,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
    testAiConnection: testAiConnectionMutation.mutateAsync,
    testEmailConnection: testEmailConnectionMutation.mutateAsync,
  };
}
