"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiErrorMessage } from "@/lib/api-error";
import {
	useDownloadDepartmentImportTemplate,
	useImportDepartments,
	type DepartmentNodalImportError,
	type ImportTemplateFormat,
} from "@/queries/departments";

import { DepartmentNodalImportWarningsDialog } from "./department-nodal-import-warnings-dialog";

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

const TEMPLATE_FILENAMES: Record<ImportTemplateFormat, string> = {
	csv: "departments-import-template.csv",
	xlsx: "departments-import-template.xlsx",
};

export function DepartmentImportDropdown() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const downloadTemplate = useDownloadDepartmentImportTemplate();
	const importDepartments = useImportDepartments();
	const [nodalWarnOpen, setNodalWarnOpen] = useState(false);
	const [nodalErrors, setNodalErrors] = useState<DepartmentNodalImportError[]>(
		[],
	);

	const handleDownload = useCallback(
		async (format: ImportTemplateFormat) => {
			try {
				const blob = await downloadTemplate.mutateAsync(format);
				downloadBlob(blob, TEMPLATE_FILENAMES[format]);
				toast.success(
					format === "csv"
						? "CSV template downloaded"
						: "Excel template downloaded",
				);
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[downloadTemplate],
	);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			e.target.value = "";
			if (!file) return;

			importDepartments.mutate(file, {
				onSuccess: (envelope) => {
					const d = envelope.data;
					const nodal = d.nodalAssignmentErrors ?? [];
					toast.success(d.message ?? "Import finished", {
						description: `${d.insertedCount} created, ${d.updatedCount} updated (${d.totalProcessed} rows)`,
					});
					if (nodal.length > 0) {
						setNodalErrors(nodal);
						setNodalWarnOpen(true);
					}
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			});
		},
		[importDepartments],
	);

	const busy = downloadTemplate.isPending || importDepartments.isPending;

	return (
		<>
			<DepartmentNodalImportWarningsDialog
				open={nodalWarnOpen}
				onOpenChange={setNodalWarnOpen}
				errors={nodalErrors}
			/>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
				className="sr-only"
				aria-hidden
				tabIndex={-1}
				onChange={handleFileChange}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="outline" disabled={busy}>
						<Upload className="size-4" aria-hidden />
						Import
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
						Templates (name, slug, nodal_email)
					</DropdownMenuLabel>
					<DropdownMenuItem
						disabled={busy}
						onSelect={(ev) => {
							ev.preventDefault();
							void handleDownload("csv");
						}}>
						<Download className="size-4" aria-hidden />
						Download CSV template
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={busy}
						onSelect={(ev) => {
							ev.preventDefault();
							void handleDownload("xlsx");
						}}>
						<Download className="size-4" aria-hidden />
						Download Excel template
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
						Upload
					</DropdownMenuLabel>
					<DropdownMenuItem
						disabled={busy}
						onSelect={(ev) => {
							ev.preventDefault();
							fileInputRef.current?.click();
						}}>
						<Upload className="size-4" aria-hidden />
						Upload CSV or Excel…
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
