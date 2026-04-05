import { isAxiosError } from "axios";

export function getApiErrorMessage(err: unknown): string {
	if (isAxiosError(err)) {
		const data = err.response?.data as
			| {
					message?: string;
					title?: string;
					data?: { message?: string; title?: string };
			  }
			| undefined;
		return (
			data?.data?.message ??
			data?.data?.title ??
			data?.message ??
			data?.title ??
			err.message ??
			"Request failed"
		);
	}
	if (err instanceof Error) return err.message;
	return "Something went wrong";
}
