import { isAxiosError } from "axios";

/** Maps API errors to a user-facing message when report data is not ready (period not closed). */
export function reportNotReadyMessage(err: unknown): string | null {
	if (!isAxiosError(err)) return null;
	const data = err.response?.data as { title?: string; message?: string } | undefined;
	const title = data?.title ?? "";
	if (title === "REPORT_NOT_READY" || data?.message?.includes("not ready")) {
		return "Reports for this period are only available after the period is closed.";
	}
	if (err.response?.status === 400) {
		return data?.message ?? data?.title ?? "This report is not available yet.";
	}
	return null;
}
