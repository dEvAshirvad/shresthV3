"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { isOrgOwnerOrAdmin } from "@/lib/org-admin";
import {
	useGetActiveOrganizationMember,
	useInviteOrganizationMember,
} from "@/queries/auth";

import { AdminInvitationsDataTable } from "../nodal-admin/organization-invitations-data-table";
import { DepartmentBulkImportCard } from "../nodal-admin/department-bulk-import-card";
import { OrganizationInvitationsImportSection } from "../nodal-admin/organization-invitations-import-section";
import { OrganizationMembersDataTable } from "../nodal-admin/organization-members-data-table";

export function AdminSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);
	const { data: activeMember } = useGetActiveOrganizationMember({
		enabled: orgReady,
	});
	const role =
		activeMember?.role ?? session?.activeOrganizationRole ?? null;
	const canAccess = isOrgOwnerOrAdmin(role);

	const invite = useInviteOrganizationMember();
	const [inviteEmail, setInviteEmail] = useState("");

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		const email = inviteEmail.trim();
		if (!email) {
			toast.error("Enter an email address");
			return;
		}
		try {
			await invite.mutateAsync({
				email,
				role: "admin",
			});
			toast.success("Invitation sent");
			setInviteEmail("");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization to manage organization admins.
			</p>
		);
	}

	if (!canAccess) {
		return (
			<Alert>
				<AlertTitle>Organization admin only</AlertTitle>
				<AlertDescription>
					This page uses <code className="text-xs">GET/POST</code>{" "}
					<code className="text-xs">/api/v1/organization/invitations</code> (list
					and bulk admin import). Sign in as <strong>owner</strong> or{" "}
					<strong>admin</strong>. Use the{" "}
					<Link href="/nodal" className="text-primary underline underline-offset-2">
						Nodal
					</Link>{" "}
					page for nodal candidates and nodal-role invitations.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-10">
			<section className="bg-card border p-6">
				<h2 className="text-lg font-semibold tracking-tight">
					Invite organization admin
				</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					Sends a pending invitation with org role <strong>admin</strong> (
					<code className="text-xs">invite-member</code>). For nodal onboarding,
					use the Nodal page and{" "}
					<code className="text-xs">/api/v1/nodal</code> flows.
				</p>
				<form
					onSubmit={handleInvite}
					className="mt-6 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
					<div className="grid min-w-0 flex-1 gap-2">
						<Label htmlFor="admin-invite-email">Email</Label>
						<Input
							id="admin-invite-email"
							type="email"
							autoComplete="email"
							className="h-10"
							placeholder="name@company.com"
							value={inviteEmail}
							onChange={(e) => setInviteEmail(e.target.value)}
						/>
					</div>
					<Button type="submit" className="h-10" disabled={invite.isPending}>
						Send admin invite
					</Button>
				</form>
			</section>

			<OrganizationInvitationsImportSection />

			<DepartmentBulkImportCard />

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Organization members
					</h2>
					<p className="text-muted-foreground text-sm">
						Owner, admin, and nodal — staff excluded. Filter by name or email in
						the table toolbar.
					</p>
				</div>
				<OrganizationMembersDataTable />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Pending admin invitations
					</h2>
					<p className="text-muted-foreground text-sm">
						Non-terminal invites where the invited org role is{" "}
						<strong>admin</strong> (from single invite or bulk import).
					</p>
				</div>
				<AdminInvitationsDataTable />
			</section>
		</div>
	);
}
