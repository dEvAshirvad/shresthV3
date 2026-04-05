"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	useDownloadEntriesExport,
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

type EntriesExportDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EntriesExportDialog({
	open,
	onOpenChange,
}: EntriesExportDialogProps) {
	const [templateId, setTemplateId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [periodId, setPeriodId] = useState("");

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

	const downloadFilled = useDownloadEntriesExport();

	useEffect(() => {
		if (!open) {
			setTemplateId("");
			setDepartmentId("");
			setPeriodId("");
		}
	}, [open]);

	const handleDownload = useCallback(
		async (format: ImportTemplateFormat) => {
			if (!templateId || !departmentId) {
				toast.error("Select template and department first");
				return;
			}
			try {
				const blob = await downloadFilled.mutateAsync({
					templateId,
					departmentId,
					format,
					...(periodId.trim() ? { periodId: periodId.trim() } : {}),
				});
				downloadBlob(
					blob,
					`kpi-entries-export.${format === "csv" ? "csv" : "xlsx"}`,
				);
				toast.success(
					format === "csv"
						? "CSV export downloaded"
						: "Excel export downloaded",
				);
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[departmentId, downloadFilled, periodId, templateId],
	);

	const busy = downloadFilled.isPending;
	const canExport = Boolean(templateId && departmentId) && !busy;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Export saved entries</DialogTitle>
					<DialogDescription>
						Download a sheet in the same layout as the import template, with KPI
						cells filled from saved entries. Omit period to use the active
						period; pick a period for archived data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="exp-ent-tpl">Template</Label>
						{tplLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={templateId} onValueChange={setTemplateId}>
								<SelectTrigger id="exp-ent-tpl" className="w-full">
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
						<Label htmlFor="exp-ent-dept">Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger id="exp-ent-dept" className="w-full">
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
						<Label htmlFor="exp-ent-period">Period (optional)</Label>
						{periodLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								value={periodId || "__active__"}
								onValueChange={(v) =>
									setPeriodId(v === "__active__" ? "" : v)
								}>
								<SelectTrigger id="exp-ent-period" className="w-full">
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
				</div>
				<DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<div className="flex flex-wrap justify-end gap-2">
						<Button
							type="button"
							variant="secondary"
							disabled={!canExport}
							onClick={() => void handleDownload("csv")}>
							<Download className="size-4" aria-hidden />
							Export CSV
						</Button>
						<Button
							type="button"
							disabled={!canExport}
							onClick={() => void handleDownload("xlsx")}>
							<Download className="size-4" aria-hidden />
							Export Excel
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
