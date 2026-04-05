"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { useSignInSocial } from "@/queries/auth";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

export type SocialSigninBtnProps = {
	/**
	 * When true (default), signed-in users see a link to the dashboard or onboarding
	 * instead of the Google control.
	 */
	morphWhenLoggedIn?: boolean;
	className?: string;
};

export function SocialSigninBtn({
	morphWhenLoggedIn = true,
	className,
}: SocialSigninBtnProps) {
	const { user, isAuthenticated, isLoadingSession } = useAuth();
	const { mutateAsync: signInWithSocial, isPending: isSigningIn } =
		useSignInSocial();

	const onboarded = user?.isOnboarded === true;
	const href = onboarded ? "/dashboard" : "/onboarding";
	const morphLabel = onboarded ? "Dashboard" : "Continue onboarding";

	if (morphWhenLoggedIn && isLoadingSession) {
		return (
			<Button
				variant="outline"
				type="button"
				disabled
				className={cn("inline-flex items-center gap-2 bg-white", className)}>
				<span className="inline-block h-5 w-5 animate-pulse rounded bg-muted" />
				<span className="text-muted-foreground text-sm">Checking session…</span>
			</Button>
		);
	}

	if (morphWhenLoggedIn && isAuthenticated && user) {
		return (
			<Button
				variant="outline"
				className={cn("inline-flex items-center gap-2 bg-white", className)}
				asChild>
				<Link href={href}>{morphLabel}</Link>
			</Button>
		);
	}

	async function onGoogleSignIn() {
		await signInWithSocial({
			provider: "google",
			callbackURL: `/dashboard`,
			newUserCallbackURL: `/onboarding`,
		});
	}

	return (
		<Button
			variant="outline"
			type="button"
			className={cn("inline-flex items-center gap-2 bg-white", className)}
			onClick={() => void onGoogleSignIn()}
			disabled={isSigningIn}>
			<Image src="/google.png" alt="Google" width={20} height={20} />
			{isSigningIn ? "Redirecting…" : "Sign in with Google"}
		</Button>
	);
}
