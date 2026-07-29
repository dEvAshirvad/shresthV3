"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SocialSigninBtn } from "@/components/social-signin-btn";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { useSignInUsername } from "@/queries/auth";
import { useNodalAssignmentCheck } from "@/queries/nodal";

export default function LoginPage() {
	const router = useRouter();
	const { isAuthenticated, user, session, status, refetch } = useAuth();
	const signIn = useSignInUsername();
	const [empId, setEmpId] = useState("");
	const [password, setPassword] = useState("");

	const role = String(session?.activeOrganizationRole || "").toLowerCase();
	const isNodal = role === "nodal";
	const isStaff = role === "staff";
	const assignment = useNodalAssignmentCheck({
		enabled: isAuthenticated && isNodal,
	});

	useEffect(() => {
		if (status !== "authenticated" || !user) return;
		if (user.isOnboarded !== true) {
			router.replace("/onboarding");
			return;
		}
		if (isNodal) {
			if (assignment.isPending) return;
			const assigned = assignment.data?.data?.isAssigned !== false;
			router.replace(assigned ? "/templates" : "/not-assigned");
			return;
		}
		if (isStaff) {
			router.replace("/staff");
			return;
		}
		router.replace("/dashboard");
	}, [
		status,
		user,
		isNodal,
		isStaff,
		assignment.isPending,
		assignment.data,
		router,
	]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!empId.trim() || !password) {
			toast.error("Emp ID and password are required");
			return;
		}
		try {
			await signIn.mutateAsync({
				username: empId.trim().toLowerCase(),
				password,
				rememberMe: true,
			});
			refetch();
			toast.success("Signed in");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4">
			<div className="w-full max-w-md space-y-8 border bg-background p-8 shadow-sm">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
					<p className="text-muted-foreground text-sm">
						Nodals and staff: use your Emp ID and password. Admins continue with
						Google.
					</p>
				</div>

				<form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
					<div className="space-y-2">
						<Label htmlFor="login-empid">Emp ID</Label>
						<Input
							id="login-empid"
							autoComplete="username"
							value={empId}
							onChange={(e) => setEmpId(e.target.value)}
							placeholder="e.g. orgcode_0001"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="login-password">Password</Label>
						<Input
							id="login-password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={signIn.isPending}>
						{signIn.isPending ? "Signing in…" : "Sign in with Emp ID"}
					</Button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background text-muted-foreground px-2">
							Admin / owner
						</span>
					</div>
				</div>

				<div className="flex justify-center">
					<SocialSigninBtn morphWhenLoggedIn={false} className="w-full justify-center" />
				</div>

				<p className="text-muted-foreground text-center text-xs">
					<Link href="/" className="underline underline-offset-4">
						Back to home
					</Link>
				</p>
			</div>
		</div>
	);
}
