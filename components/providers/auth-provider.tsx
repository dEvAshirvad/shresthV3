"use client";

import { useRouter } from "next/navigation";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	type ReactNode,
} from "react";

import {
	GetSessionResponse,
	Session,
	useGetSession,
	User,
} from "@/queries/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
	/** Full payload from get-session (or `null` if unauthenticated / empty). */
	data: GetSessionResponse | null;
	user: User | null;
	session: Session | null;
	isAuthenticated: boolean;
	/** Use in protected layouts: wait until `loading`, then require `authenticated`. */
	status: AuthStatus;
	isLoadingSession: boolean;
	errorSession: Error | null;
	refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const query = useGetSession();

	const value = useMemo((): AuthContextValue => {
		const data = query.data ?? null;
		const user = data?.user ?? null;
		const session = data?.session ?? null;
		const isAuthenticated = Boolean(user);
		const status: AuthStatus = query.isPending
			? "loading"
			: isAuthenticated
				? "authenticated"
				: "unauthenticated";

		return {
			data,
			user,
			session,
			isAuthenticated,
			status,
			isLoadingSession: query.isPending,
			errorSession: query.error instanceof Error ? query.error : null,
			refetch: () => {
				void query.refetch();
			},
		};
	}, [query.data, query.error, query.isPending, query.refetch]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** App-wide session + user; use inside `AuthProvider` (wrap root layout). For route guards, branch on `status` or `isAuthenticated`. */
export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within <AuthProvider>");
	}
	return ctx;
}

/** Full-screen gate while session is resolved or a redirect is in progress. */
export function AuthLoadingScreen() {
	return (
		<div
			className="fixed inset-0 z-200 flex items-center justify-center bg-background"
			role="status"
			aria-live="polite"
			aria-label="Loading">
			<div className="grid grid-cols-3 gap-2">
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="size-3 rounded-sm bg-primary shadow-sm"
						style={{
							animation: "auth-square-fade 1.2s ease-in-out infinite",
							animationDelay: `${i * 100}ms`,
						}}
					/>
				))}
			</div>
		</div>
	);
}

export type ProtectedRouteProps = {
	children: ReactNode;
	/**
	 * When true (default), users who are signed in but `isOnboarded !== true` are sent to `/onboarding`.
	 * Set false for the onboarding flow itself (only a login is required).
	 */
	requireOnboarded?: boolean;
};

/**
 * Wrap route segments that need auth. Shows {@link AuthLoadingScreen} until the session is known,
 * then redirects: not signed in → `/`, signed in but not onboarded → `/onboarding` (if `requireOnboarded`).
 */
export function ProtectedRoute({
	children,
	requireOnboarded = true,
}: ProtectedRouteProps) {
	const router = useRouter();
	const { status, user, isAuthenticated } = useAuth();

	const canRender =
		status !== "loading" &&
		isAuthenticated &&
		(!requireOnboarded || user?.isOnboarded === true);

	useEffect(() => {
		if (status === "loading") return;

		// Defer until after the App Router is initialised (avoids "Router action dispatched before initialization")
		const id = window.setTimeout(() => {
			if (!isAuthenticated) {
				router.replace("/");
				return;
			}
			if (requireOnboarded && user?.isOnboarded !== true) {
				router.replace("/onboarding");
			}
		}, 0);

		return () => window.clearTimeout(id);
	}, [status, isAuthenticated, user?.isOnboarded, requireOnboarded, router]);

	if (!canRender) {
		return <AuthLoadingScreen />;
	}

	return <>{children}</>;
}
