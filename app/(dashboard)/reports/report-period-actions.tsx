"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import { useJob } from "@/queries/jobs";
import {
	reportKeys,
	useDownloadDepartmentReportZip,
	useSendWhatsAppPerformance,
	type ListWhatsAppSendsQuery,
	type WhatsAppSendStatus,
	useListWhatsAppSends,
} from "@/queries/reports";

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

type Props = {
	periodId: string;
};

export function ReportPeriodActions({ periodId }: Props) {
	const queryClient = useQueryClient();
	const downloadZip = useDownloadDepartmentReportZip();
	const sendWhatsApp = useSendWhatsAppPerformance(periodId);

	const [sendDialogOpen, setSendDialogOpen] = useState(false);
	const [dryRun, setDryRun] = useState(true);
	const [resend, setResend] = useState(false);
	const [delayMs, setDelayMs] = useState("350");
	const [departmentIdForSend, setDepartmentIdForSend] = useState("all");
	const [waJobId, setWaJobId] = useState<string | null>(null);
	const terminalHandled = useRef(false);

	useEffect(() => {
		terminalHandled.current = false;
	}, [waJobId]);

	const jobQuery = useJob(waJobId);

	useEffect(() => {
		if (!waJobId || terminalHandled.current) return;
		const job = jobQuery.data?.data?.job;
		if (!job || (job.state !== "completed" && job.state !== "failed")) return;
		terminalHandled.current = true;

		if (job.state === "completed") {
			const rv = job.returnvalue as
				| {
						summary?: {
							sent: number;
							failed: number;
							skipped: number;
							dryRun?: boolean;
						};
				  }
				| undefined;
			const sum = rv?.summary;
			if (sum) {
				toast.success("WhatsApp batch finished", {
					description: `sent ${sum.sent} · failed ${sum.failed} · skipped ${sum.skipped}${sum.dryRun ? " · dry run" : ""}`,
				});
			} else {
				toast.success("Background job completed");
			}
			void queryClient.invalidateQueries({
				queryKey: reportKeys.whatsappSends(periodId),
			});
			setWaJobId(null);
			setSendDialogOpen(false);
		} else {
			toast.error(job.failedReason ?? "WhatsApp batch failed");
			void queryClient.invalidateQueries({
				queryKey: reportKeys.whatsappSends(periodId),
			});
			setWaJobId(null);
		}
	}, [waJobId, jobQuery.data, periodId, queryClient]);

	const { data: deptRes } = useOrgDepartments({ page: 1, limit: 200 });
	const departments = deptRes?.data?.docs ?? [];

	const [auditPage, setAuditPage] = useState(1);
	const [auditStatus, setAuditStatus] = useState<WhatsAppSendStatus | "all">(
		"all",
	);
	const auditParams = useMemo((): ListWhatsAppSendsQuery => {
		const p: ListWhatsAppSendsQuery = { page: auditPage, limit: 20 };
		if (auditStatus !== "all") p.status = auditStatus;
		return p;
	}, [auditPage, auditStatus]);

	const { data: sendsRes, isFetching: sendsLoading } = useListWhatsAppSends(
		periodId,
		auditParams,
	);
	const sends = sendsRes?.data?.docs ?? [];
	const sendsTotal = sendsRes?.data?.total ?? 0;
	const sendsHasNext = sendsRes?.data?.hasNextPage ?? false;
	const sendsHasPrev = sendsRes?.data?.hasPreviousPage ?? false;

	const handleDownloadZip = async () => {
		try {
			const blob = await downloadZip.mutateAsync({ periodId });
			downloadBlob(blob, `department-report-${periodId}.zip`);
			toast.success("Department report ZIP downloaded");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	const handleSendWhatsApp = async () => {
		try {
			const parsedDelay = Number.parseInt(delayMs, 10);
			const body = {
				dryRun,
				resend,
				delayMs: Number.isFinite(parsedDelay) ? parsedDelay : 350,
				...(departmentIdForSend !== "all"
					? { departmentId: departmentIdForSend }
					: {}),
			};
			const result = await sendWhatsApp.mutateAsync(body);
			if (result.httpStatus === 200) {
				const d = result.envelope.data;
				const sum = d.summary;
				toast.success(d.message ?? "WhatsApp run completed", {
					description: `sent ${sum.sent} · failed ${sum.failed} · skipped ${sum.skipped}${sum.dryRun ? " · dry run" : ""}`,
				});
				setSendDialogOpen(false);
			} else {
				const d = result.envelope.data;
				toast.message("WhatsApp batch queued", {
					description: d.message ?? `Job ${d.jobId}`,
				});
				setWaJobId(d.jobId);
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	const waBusy = sendWhatsApp.isPending || !!waJobId;
	const jobState = jobQuery.data?.data?.job?.state;

	return (
		<section className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={downloadZip.isPending}
					onClick={() => void handleDownloadZip()}>
					{downloadZip.isPending ? "Downloading…" : "Download department ZIP"}
				</Button>
				<Button
					type="button"
					disabled={waBusy}
					onClick={() => setSendDialogOpen(true)}>
					WhatsApp send / retry
				</Button>
			</div>

			<Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send WhatsApp performance messages</DialogTitle>
						<DialogDescription>
							Uses <code className="text-xs">POST /api/v1/reports/:periodId/whatsapp/send</code>
							. With background jobs enabled, the server returns{" "}
							<strong>202</strong> and a <strong>jobId</strong>; this page polls{" "}
							<code className="text-xs">GET /api/v1/jobs/:jobId</code> until the
							batch finishes.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 py-2">
						<div className="grid gap-2">
							<Label>Department (optional)</Label>
							<Select
								value={departmentIdForSend}
								onValueChange={setDepartmentIdForSend}>
								<SelectTrigger>
									<SelectValue placeholder="All departments" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All departments</SelectItem>
									{departments.map((d) => (
										<SelectItem key={d._id} value={d._id}>
											{d.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="wa-delay">Delay (ms)</Label>
							<Input
								id="wa-delay"
								type="number"
								min={0}
								max={120000}
								value={delayMs}
								onChange={(e) => setDelayMs(e.target.value)}
							/>
						</div>
						<div className="flex flex-wrap gap-4 text-sm">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={dryRun}
									onChange={(e) => setDryRun(e.target.checked)}
								/>
								Dry run
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={resend}
									onChange={(e) => setResend(e.target.checked)}
								/>
								Resend already sent
							</label>
						</div>
						{waJobId ? (
							<p className="text-muted-foreground text-sm">
								Background job: <span className="font-mono">{waJobId}</span>
								{jobState ? ` · ${jobState}` : " · …"}
							</p>
						) : null}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSendDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={waBusy}
							onClick={() => void handleSendWhatsApp()}>
							{sendWhatsApp.isPending
								? "Sending…"
								: waJobId
									? "Queued…"
									: "Run send"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<Label className="text-sm font-medium">WhatsApp send audit</Label>
					<Select
						value={auditStatus}
						onValueChange={(v) => {
							setAuditStatus(v as WhatsAppSendStatus | "all");
							setAuditPage(1);
						}}>
						<SelectTrigger className="h-8 w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value="pending">pending</SelectItem>
							<SelectItem value="sent">sent</SelectItem>
							<SelectItem value="failed">failed</SelectItem>
							<SelectItem value="skipped">skipped</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{sendsLoading ? (
					<p className="text-muted-foreground text-sm">Loading audit…</p>
				) : sends.length === 0 ? (
					<p className="text-muted-foreground text-sm">No send rows for this period.</p>
				) : (
					<ul className="max-h-48 space-y-1 overflow-auto rounded-md border p-2 text-sm">
						{sends.map((r) => (
							<li key={r._id} className="flex flex-wrap gap-x-2 gap-y-0.5">
								<span className="font-medium">{r.status}</span>
								{r.phoneMasked ? (
									<span className="text-muted-foreground">{r.phoneMasked}</span>
								) : null}
								{r.performerBucket ? (
									<span className="text-muted-foreground">{r.performerBucket}</span>
								) : null}
								{r.dryRun ? <span className="text-muted-foreground">dryRun</span> : null}
							</li>
						))}
					</ul>
				)}
				{sendsTotal > 0 ? (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!sendsHasPrev}
							onClick={() => setAuditPage((p) => Math.max(1, p - 1))}>
							Previous
						</Button>
						<span className="text-muted-foreground text-xs">
							Page {auditPage} · {sendsTotal} total
						</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!sendsHasNext}
							onClick={() => setAuditPage((p) => p + 1)}>
							Next
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}
