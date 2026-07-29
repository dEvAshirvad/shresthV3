"use client";

import { toast } from "sonner";
import { Download, KeyRound, RefreshCw, Send } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadNodalCredentialsCsv } from "@/lib/nodal-credentials-csv";
import {
	useDownloadAllNodalCredentials,
	useProvisionNodalCredentials,
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
	const provisionMut = useProvisionNodalCredentials();
	const downloadAllMut = useDownloadAllNodalCredentials();

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

	const handleProvision = () => {
		provisionMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				const creds = d.credentials ?? [];
				const errCount = d.errors?.length ?? 0;
				toast.success(d.message ?? "Provisioning completed", {
					description: `${creds.length} credential(s)${errCount ? ` · ${errCount} errors` : ""}`,
				});
				if (creds.length) {
					downloadNodalCredentialsCsv(creds);
					toast.message("Credentials CSV downloaded — save it securely.");
				}
			},
			onError: (e) => toast.error(getApiErrorMessage(e)),
		});
	};

	const handleDownloadAll = () => {
		downloadAllMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				const creds = d.credentials ?? [];
				const errCount = d.errors?.length ?? 0;
				toast.success(d.message ?? "Credentials ready", {
					description: `${creds.length}/${d.total ?? creds.length} credential(s)${errCount ? ` · ${errCount} errors` : ""}`,
				});
				if (creds.length) {
					downloadNodalCredentialsCsv(
						creds,
						`nodal-credentials-all-${new Date().toISOString().slice(0, 10)}.csv`,
					);
				}
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

	const busy =
		syncMut.isPending ||
		sendMut.isPending ||
		provisionMut.isPending ||
		downloadAllMut.isPending;

	return (
		<div className="space-y-10">
			<section className="bg-muted/20 border border-dashed p-6">
				<h2 className="text-lg font-semibold tracking-tight">
					Nodal credentials
				</h2>
				<p className="text-muted-foreground mt-1 max-w-3xl text-sm">
					One-shot download regenerates passwords for <strong>all</strong> nodals
					in the active org and downloads a CSV. Passwords are shown only in the
					file — save it securely.
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button
						type="button"
						disabled={busy}
						className="gap-2"
						onClick={() => void handleDownloadAll()}>
						<Download className="size-4" aria-hidden />
						{downloadAllMut.isPending
							? "Generating…"
							: "Download all credentials"}
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={busy}
						className="gap-2"
						onClick={() => void handleProvision()}>
						<KeyRound className="size-4" aria-hidden />
						Provision missing only
					</Button>
					<NodalImportDropdown
						onCredentials={(creds) => {
							if (creds.length) downloadNodalCredentialsCsv(creds);
						}}
					/>
				</div>
			</section>

			<section className="border border-dashed p-6 opacity-80">
				<h2 className="text-sm font-semibold tracking-tight">
					Legacy (invite / sync)
				</h2>
				<p className="text-muted-foreground mt-1 max-w-3xl text-sm">
					Prefer <strong>Download all credentials</strong> above. Sync and send
					invitations remain for older Google-invite nodals only.
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
						variant="outline"
						disabled={busy}
						className="gap-2"
						onClick={() => void handleSendInvites()}>
						<Send className="size-4" aria-hidden />
						Send invitations (legacy)
					</Button>
				</div>
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Nodal candidates
					</h2>
					<p className="text-muted-foreground text-sm">
						<code className="text-xs">GET /api/v1/nodal</code> — org-scoped
						records in <strong>tb_nodals</strong> (name, phone, empId, optional
						email).
					</p>
				</div>
				<NodalCandidatesDataTable
					onCredentials={(creds) => {
						if (creds.length) downloadNodalCredentialsCsv(creds);
					}}
				/>
			</section>

			<section className="space-y-4 opacity-80">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Pending nodal invitations (legacy)
					</h2>
					<p className="text-muted-foreground text-sm">
						Open invites whose org role is <strong>nodal</strong>. New nodals
						should not need invitations.
					</p>
				</div>
				<NodalInvitationsDataTable />
			</section>
		</div>
	);
}
