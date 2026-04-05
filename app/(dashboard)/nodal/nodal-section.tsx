"use client";

import { toast } from "sonner";
import { RefreshCw, Send } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import {
	useSendInvitationToRestNodals,
	useSyncNodalsFromOrgMembers,
} from "@/queries/nodal";

import { NodalInvitationsDataTable } from "../nodal-admin/organization-invitations-data-table";
import { NodalCandidatesDataTable } from "./nodal-candidates-data-table";
import { NodalImportDropdown } from "./nodal-import-dropdown";

export function NodalSection() {
	const { session } = useAuth();
	const orgReady = Boolean(session?.activeOrganizationId);

	const syncMut = useSyncNodalsFromOrgMembers();
	const sendMut = useSendInvitationToRestNodals();

	const handleSync = () => {
		syncMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				toast.success(d.message ?? "Sync completed", {
					description: `${d.linked} linked · ${d.skipped?.length ?? 0} skipped`,
				});
			},
			onError: (e) => toast.error(getApiErrorMessage(e)),
		});
	};

	const handleSendInvites = () => {
		sendMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				const errCount = d.errors?.length ?? 0;
				toast.success(d.message ?? "Invitation run completed", {
					description: `${d.nodals?.length ?? 0} processed${errCount ? ` · ${errCount} errors` : ""}`,
				});
			},
			onError: (e) => toast.error(getApiErrorMessage(e)),
		});
	};

	if (!orgReady) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization to manage nodal candidates.
			</p>
		);
	}

	const busy = syncMut.isPending || sendMut.isPending;

	return (
		<div className="space-y-10">
			<section className="bg-muted/20 border border-dashed p-6">
				<h2 className="text-lg font-semibold tracking-tight">Nodal API actions</h2>
				<p className="text-muted-foreground mt-1 max-w-3xl text-sm">
					<code className="text-xs">POST /api/v1/nodal/sync-from-org-members</code>{" "}
					links <strong>userId</strong> / <strong>memberId</strong> from org members
					by email.{" "}
					<code className="text-xs">
						POST /api/v1/nodal/send-invitation-to-rest-nodals
					</code>{" "}
					creates or resends <strong>nodal</strong>-role invitations for rows
					without <strong>userId</strong> (see{" "}
					<code className="text-xs">nodal.api.md</code>).
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button
						type="button"
						variant="secondary"
						disabled={busy}
						className="gap-2"
						onClick={() => void handleSync()}>
						<RefreshCw className="size-4" aria-hidden />
						Sync from org members
					</Button>
					<Button
						type="button"
						disabled={busy}
						className="gap-2"
						onClick={() => void handleSendInvites()}>
						<Send className="size-4" aria-hidden />
						Send invitations to nodals without user
					</Button>
					<NodalImportDropdown />
				</div>
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Nodal candidates
					</h2>
					<p className="text-muted-foreground text-sm">
						<code className="text-xs">GET /api/v1/nodal</code> — org-scoped
						records in <strong>tb_nodals</strong> (name, phone, optional email).
					</p>
				</div>
				<NodalCandidatesDataTable />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Pending nodal invitations
					</h2>
					<p className="text-muted-foreground text-sm">
						Open invites whose org role is <strong>nodal</strong> (pending /
						sent / similar). Org admins also see this list when using an owner or
						admin session via the REST invitation list.
					</p>
				</div>
				<NodalInvitationsDataTable />
			</section>
		</div>
	);
}
