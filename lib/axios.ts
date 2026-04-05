import axios from "axios";

/**
 * Axios instance for API requests.
 * Cookies are handled by the server (httpOnly, etc.); we send them automatically
 * via withCredentials. No localStorage or client-side cookie handling.
 */
export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND ?? "",
	withCredentials: true,
	headers: {
		Accept: "application/json, text/plain, */*",
		// Do not set Content-Type globally. A default of application/json breaks
		// multipart uploads (FormData): the body becomes JSON with `{}` for File.
		// Axios sets `application/json` for plain objects and multipart for FormData.
	},
});

// Optional: add response interceptor for global error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Forward server errors; can add toast or redirect here if needed
		return Promise.reject(error);
	},
);
