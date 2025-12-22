import { Resend } from "resend";

export function createEmailClient({ apiKey }: { apiKey: string }) {
	return new Resend(apiKey);
}
