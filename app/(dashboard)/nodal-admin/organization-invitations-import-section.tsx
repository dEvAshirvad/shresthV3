"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getApiErrorMessage } from "@/lib/api-error";
import {
	useDownloadOrganizationInvitationsImportTemplate,
	useImportOrganizationInvitations,
	type OrgInvitationImportData,
	type OrgInvitationImportTemplateFormat,
} from "@/queries/organization-invitations-import";

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

const TEMPLATE_NAMES: Record<OrgInvitationImportTemplateFormat, string> = {
	csv: "admin-invitations-import-template.csv",
	xlsx: "admin-invitations-import-template.xlsx",
};

function ImportResultDialog({
	open,
	onOpenChange,
	data,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: OrgInvitationImportData;
}) {
	const hasSkips = data.skipped.length > 0;
	const hasErrs = data.errors.length > 0;
	const hasMailFails = data.emailFailures.length > 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-lg gap-0 p-0 sm:max-w-xl">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle>Invitation import finished</DialogTitle>
					<DialogDescription>{data.message}</DialogDescription>
				</DialogHeader>
				<div className="text-muted-foreground space-y-1 border-y border-border px-6 py-3 text-sm">
					<p>
						<span className="text-foreground font-medium">{data.created}</span>{" "}
						created ·{" "}
						<span className="text-foreground font-medium">{data.resent}</span>{" "}
						resent ·{" "}
						<span className="text-foreground font-medium">
							{data.totalProcessed}
						</span>{" "}
						rows processed
					</p>
				</div>
				<ScrollArea className="max-h-[50vh] px-6 py-4">
					<div className="space-y-6 pr-4">
						{hasSkips ? (
							<div className="space-y-2">
								<h4 className="text-foreground text-sm font-medium">Skipped</h4>
								<ul className="text-muted-foreground space-y-1.5 text-xs">
									{data.skipped.map((s, i) => (
										<li key={`${s.email}-${i}`}>
											<span className="font-mono text-foreground">{s.email}</span>{" "}
											— {s.reason}
										</li>
									))}
								</ul>
							</div>
						) : null}
						{hasErrs ? (
							<div className="space-y-2">
								<h4 className="text-foreground text-sm font-medium">Errors</h4>
								<ul className="text-muted-foreground space-y-1.5 text-xs">
									{data.errors.map((e, i) => (
										<li key={`${e.email ?? i}-${i}`}>
											{e.row != null ? (
												<span className="text-foreground">Row {e.row}: </span>
											) : null}
											{e.email ? (
												<span className="font-mono text-foreground">
													{e.email}{" "}
												</span>
											) : null}
											{e.message}
										</li>
									))}
								</ul>
							</div>
						) : null}
						{hasMailFails ? (
							<div className="space-y-2">
								<h4 className="text-destructive text-sm font-medium">
									Email failures
								</h4>
								<ul className="text-muted-foreground space-y-1.5 text-xs">
									{data.emailFailures.map((f, i) => (
										<li key={`${f.email}-${i}`}>
											<span className="font-mono text-foreground">{f.email}</span>{" "}
											— {f.message}
										</li>
									))}
								</ul>
							</div>
						) : null}
						{!hasSkips && !hasErrs && !hasMailFails ? (
							<p className="text-muted-foreground text-sm">
								No skips, validation errors, or email failures for this run.
							</p>
						) : null}
					</div>
				</ScrollArea>
				<DialogFooter className="p-6 pt-2">
					<Button type="button" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function OrganizationInvitationsImportSection() {
	const fileRef = useRef<HTMLInputElement>(null);
	const downloadTpl = useDownloadOrganizationInvitationsImportTemplate();
	const importMut = useImportOrganizationInvitations();
	const [resultOpen, setResultOpen] = useState(false);
	const [lastResult, setLastResult] = useState<OrgInvitationImportData | null>(
		null,
	);

	const handleDownload = useCallback(
		async (format: OrgInvitationImportTemplateFormat) => {
			try {
				const blob = await downloadTpl.mutateAsync(format);
				downloadBlob(blob, TEMPLATE_NAMES[format]);
				toast.success(
					format === "csv"
						? "CSV template downloaded"
						: "Excel template downloaded",
				);
			} catch (e) {
				toast.error(getApiErrorMessage(e));
			}
		},
		[downloadTpl],
	);

	const handleFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			e.target.value = "";
			if (!file) return;
			importMut.mutate(file, {
				onSuccess: (env) => {
					const d = env.data;
					setLastResult(d);
					setResultOpen(true);
					toast.success(d.message ?? "Import completed");
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			});
		},
		[importMut],
	);

	const busy = downloadTpl.isPending || importMut.isPending;

	return (
		<section className="bg-card border p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Bulk import org admins
					</h2>
					<p className="text-muted-foreground mt-1 max-w-2xl text-sm">
						<code className="text-xs">email</code> and{" "}
						<code className="text-xs">role</code> — each row must use role{" "}
						<strong>admin</strong> (owner/admin only). For{" "}
						<strong>nodal</strong> candidates and nodal-role invites, use the{" "}
						<strong>Nodal</strong> page (<code className="text-xs">/nodal</code>
						). Requires a correct <strong>Origin</strong> for invite links.
					</p>
				</div>
			</div>
			<div className="mt-6 flex flex-wrap gap-2">
				<input
					ref={fileRef}
					type="file"
					accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
					className="sr-only"
					aria-hidden
					tabIndex={-1}
					onChange={handleFile}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={busy}
					className="gap-1.5"
					onClick={() => void handleDownload("csv")}>
					<Download className="size-4" aria-hidden />
					Template CSV
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={busy}
					className="gap-1.5"
					onClick={() => void handleDownload("xlsx")}>
					<FileSpreadsheet className="size-4" aria-hidden />
					Template Excel
				</Button>
				<Button
					type="button"
					size="sm"
					disabled={busy}
					className="gap-1.5"
					onClick={() => fileRef.current?.click()}>
					<Upload className="size-4" aria-hidden />
					Upload file
				</Button>
			</div>

			{lastResult ? (
				<ImportResultDialog
					open={resultOpen}
					onOpenChange={(o) => {
						setResultOpen(o);
						if (!o) setLastResult(null);
					}}
					data={lastResult}
				/>
			) : null}
		</section>
	);
}
