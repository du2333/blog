import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSystemConfigFn,
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

  return {
    settings: data,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
  };
}
