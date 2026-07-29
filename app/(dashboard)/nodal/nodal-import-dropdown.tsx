"use client";

import { useCallback, useRef } from "react";
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
	useDownloadNodalImportTemplate,
	useImportNodals,
	type NodalCredential,
	type NodalImportTemplateFormat,
} from "@/queries/nodal";

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

const TEMPLATE_FILENAMES: Record<NodalImportTemplateFormat, string> = {
	csv: "nodal-import-template.csv",
	xlsx: "nodal-import-template.xlsx",
};

export function NodalImportDropdown({
	onCredentials,
}: {
	onCredentials?: (creds: NodalCredential[]) => void;
} = {}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const downloadTemplate = useDownloadNodalImportTemplate();
	const importNodals = useImportNodals();

	const handleDownload = useCallback(
		async (format: NodalImportTemplateFormat) => {
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
			importNodals.mutate(file, {
				onSuccess: (env) => {
					const d = env.data;
					const creds = d.credentials ?? [];
					onCredentials?.(creds);
					toast.success(d.message ?? "Import finished", {
						description: `${d.insertedCount} created, ${d.updatedCount} updated (${d.totalProcessed} rows)${creds.length ? ` · ${creds.length} credentials` : ""}`,
					});
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			});
		},
		[importNodals, onCredentials],
	);

	const busy = downloadTemplate.isPending || importNodals.isPending;

	return (
		<>
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
						Import nodals
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
						Template (name, phone, email)
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
