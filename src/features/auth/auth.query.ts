import { queryOptions } from "@tanstack/react-query";
import { getIsEmailConfiguredFn, getSessionFn } from "@/features/auth/auth.api";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await getSessionFn();
    return session;
  },
});

export const emailConfiguredQuery = queryOptions({
  queryKey: ["isEmailConfigured"],
  queryFn: async () => {
    const isEmailConfigured = await getIsEmailConfiguredFn();
    return isEmailConfigured;
  },
});
