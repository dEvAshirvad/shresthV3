"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import {
	useDownloadEntriesImportTemplate,
	useImportEntries,
	type ImportTemplateFormat,
} from "@/queries/entries";
import { useListKpiPeriods } from "@/queries/periods";
import { useListTemplates } from "@/queries/templates";

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

type EntriesBulkImportDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EntriesBulkImportDialog({
	open,
	onOpenChange,
}: EntriesBulkImportDialogProps) {
	const [templateId, setTemplateId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [periodId, setPeriodId] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const { data: tplRes, isPending: tplLoading } = useListTemplates({
		page: 1,
		limit: 200,
	});
	const templates = tplRes?.data?.docs ?? [];

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const { data: periodRes, isPending: periodLoading } = useListKpiPeriods({
		page: 1,
		limit: 100,
	});
	const kpiPeriods = periodRes?.data?.docs ?? [];

	const downloadTpl = useDownloadEntriesImportTemplate();
	const importMut = useImportEntries();

	useEffect(() => {
		if (!open) {
			setTemplateId("");
			setDepartmentId("");
			setPeriodId("");
			setFile(null);
		}
	}, [open]);

	const handleDownloadBlank = useCallback(
		async (format: ImportTemplateFormat) => {
			if (!templateId || !departmentId) {
				toast.error("Select template and department first");
				return;
			}
			try {
				const blob = await downloadTpl.mutateAsync({
					templateId,
					departmentId,
					format,
				});
				downloadBlob(
					blob,
					`kpi-entries-import-template.${format === "csv" ? "csv" : "xlsx"}`,
				);
				toast.success(
					format === "csv"
						? "Blank CSV template downloaded"
						: "Blank Excel template downloaded",
				);
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[departmentId, downloadTpl, templateId],
	);

	const handleImport = () => {
		if (!templateId || !departmentId) {
			toast.error("Select template and department");
			return;
		}
		if (!file) {
			toast.error("Choose a CSV or Excel file");
			return;
		}
		importMut.mutate(
			{
				file,
				query: {
					templateId,
					departmentId,
					...(periodId.trim() ? { periodId: periodId.trim() } : {}),
				},
			},
			{
				onSuccess: (envelope) => {
					const d = envelope.data;
					const errCount = d.errors?.length ?? 0;
					const desc = `${d.processed} rows processed, ${d.upserted} upserted${
						errCount ? `, ${errCount} row errors` : ""
					}. Period: ${d.periodId}`;
					toast.success(d.message ?? "Import completed", { description: desc });
					if (errCount && d.errors?.length) {
						const preview = d.errors
							.slice(0, 3)
							.map((e) => `Row ${e.row}: ${e.message}`)
							.join("\n");
						toast.message("Import row errors", {
							description: preview + (errCount > 3 ? "\n…" : ""),
						});
					}
					onOpenChange(false);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	};

	const busy = downloadTpl.isPending || importMut.isPending;
	const canImport = Boolean(templateId && departmentId && file && !busy);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Import CSV</DialogTitle>
					<DialogDescription>
						Download a blank template (one row per matching employee), fill KPI
						values, then upload. Period is optional: the active period is used
						when omitted.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="bulk-ent-tpl">Template</Label>
						{tplLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={templateId} onValueChange={setTemplateId}>
								<SelectTrigger id="bulk-ent-tpl" className="w-full">
									<SelectValue placeholder="Select template" />
								</SelectTrigger>
								<SelectContent>
									{templates.map((t) => (
										<SelectItem key={t._id} value={t._id}>
											{t.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="bulk-ent-dept">Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger id="bulk-ent-dept" className="w-full">
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									{departments.map((d) => (
										<SelectItem key={d._id} value={d._id}>
											{d.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="bulk-ent-period">Period (optional)</Label>
						{periodLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								value={periodId || "__active__"}
								onValueChange={(v) =>
									setPeriodId(v === "__active__" ? "" : v)
								}>
								<SelectTrigger id="bulk-ent-period" className="w-full">
									<SelectValue placeholder="Active period (default)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__active__">
										Active period (default)
									</SelectItem>
									{kpiPeriods.map((p) => (
										<SelectItem key={p._id} value={p._id}>
											{p.name} ({p.status})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div className="space-y-2">
						<p className="text-muted-foreground text-xs font-medium">
							Blank template (empty KPI cells)
						</p>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								disabled={busy || !templateId || !departmentId}
								onClick={() => void handleDownloadBlank("csv")}>
								<Download className="size-4" aria-hidden />
								CSV
							</Button>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								disabled={busy || !templateId || !departmentId}
								onClick={() => void handleDownloadBlank("xlsx")}>
								<Download className="size-4" aria-hidden />
								Excel
							</Button>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="bulk-ent-file">File</Label>
						<Input
							id="bulk-ent-file"
							type="file"
							accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							disabled={busy}
							onChange={(e) => {
								setFile(e.target.files?.[0] ?? null);
							}}
						/>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						disabled={!canImport}
						onClick={() => void handleImport()}>
						<Upload className="size-4" aria-hidden />
						Run import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
