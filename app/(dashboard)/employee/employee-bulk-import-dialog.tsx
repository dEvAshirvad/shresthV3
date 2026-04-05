"use client";

import { useCallback, useState } from "react";
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
	useDownloadEmployeeImportTemplate,
	useImportEmployees,
	type ImportTemplateFormat,
} from "@/queries/employee";

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

const TEMPLATE_NAMES: Record<ImportTemplateFormat, string> = {
	csv: "employees-import-template.csv",
	xlsx: "employees-import-template.xlsx",
};

type EmployeeBulkImportDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EmployeeBulkImportDialog({
	open,
	onOpenChange,
}: EmployeeBulkImportDialogProps) {
	const [departmentId, setDepartmentId] = useState("");

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const downloadTpl = useDownloadEmployeeImportTemplate();
	const importMut = useImportEmployees();

	const handleDownload = useCallback(
		async (format: ImportTemplateFormat) => {
			try {
				const blob = await downloadTpl.mutateAsync(format);
				downloadBlob(blob, TEMPLATE_NAMES[format]);
				toast.success(
					format === "csv" ? "CSV template downloaded" : "Excel template downloaded",
				);
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[downloadTpl],
	);

	const handleFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			e.target.value = "";
			if (!file) return;
			if (!departmentId) {
				toast.error("Select a department first");
				return;
			}
			importMut.mutate(
				{ file, departmentId },
				{
					onSuccess: (envelope) => {
						const d = envelope.data;
						toast.success(d.message ?? "Import completed", {
							description: `${d.insertedCount} created, ${d.updatedCount} updated (${d.totalProcessed} rows)`,
						});
						onOpenChange(false);
					},
					onError: (err) => toast.error(getApiErrorMessage(err)),
				},
			);
		},
		[departmentId, importMut, onOpenChange],
	);

	const busy = downloadTpl.isPending || importMut.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Bulk import employees</DialogTitle>
					<DialogDescription>
						Download a template, fill name and phone (required), then upload. Rows
						are upserted by phone for the department you select.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="bulk-import-dept">Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger id="bulk-import-dept">
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
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={busy}
							onClick={() => void handleDownload("csv")}>
							<Download className="size-4" aria-hidden />
							CSV template
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={busy}
							onClick={() => void handleDownload("xlsx")}>
							<Download className="size-4" aria-hidden />
							Excel template
						</Button>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="bulk-import-file">Upload file</Label>
						<Input
							id="bulk-import-file"
							type="file"
							accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							disabled={busy || !departmentId}
							onChange={handleFile}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
