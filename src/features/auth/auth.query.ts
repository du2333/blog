import { queryOptions } from "@tanstack/react-query";
import {
	getIsEmailVerficationRequiredFn,
	getSessionFn,
} from "@/features/auth/auth.api";

export const sessionQuery = queryOptions({
	queryKey: ["session"],
	queryFn: async () => {
		const session = await getSessionFn();
		return session;
	},
});

export const emailVerficationRequiredQuery = queryOptions({
	queryKey: ["emailVerficationRequired"],
	queryFn: async () => {
		const isEmailVerficationRequired = await getIsEmailVerficationRequiredFn();
		return isEmailVerficationRequired;
	},
});
