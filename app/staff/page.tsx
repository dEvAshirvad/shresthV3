"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSignOut } from "@/queries/auth";

export default function StaffPage() {
	const { user, session } = useAuth();
	const signOut = useSignOut();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome{user?.name ? `, ${user.name}` : ""}</CardTitle>
					<CardDescription>
						Your role in this organization does not include the management
						dashboard. Contact an owner or admin if you need access.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{session?.activeOrganizationId ? (
						<p className="text-sm text-muted-foreground">
							You are signed in to an organization workspace. Only owners,
							admins, and nodal officers can open dashboard tools.
						</p>
					) : null}
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" asChild>
							<Link href="/">Home</Link>
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								void signOut.mutateAsync(undefined);
							}}
							disabled={signOut.isPending}>
							Sign out
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
