"use client";

import { type Table } from "@tanstack/react-table";
import { Download, FileUp, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { useBulkSubmitKpiEntries } from "@/queries/entries";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import type { EntryTableRow } from "./map-entry-row";

type PeriodOption = { _id: string; name: string; key: string };
type TemplateOption = { _id: string; name: string };

type EntriesToolbarProps = {
	table: Table<EntryTableRow>;
	onNewDraft: () => void;
	onBulkImport: () => void;
	onExport: () => void;
	templateFilter: string;
	onTemplateFilterChange: (value: string) => void;
	periodFilter: string;
	onPeriodFilterChange: (value: string) => void;
	templates: TemplateOption[];
	periods: PeriodOption[];
};

export function EntriesToolbar({
	table,
	onNewDraft,
	onBulkImport,
	onExport,
	templateFilter,
	onTemplateFilterChange,
	periodFilter,
	onPeriodFilterChange,
	templates,
	periods,
}: EntriesToolbarProps) {
	const bulkSubmit = useBulkSubmitKpiEntries();

	const draftSelectedRows = table
		.getFilteredSelectedRowModel()
		.rows.filter((r) => r.original.status === "draft");
	const selectedDraftCount = draftSelectedRows.length;

	const handleBulkSubmit = async () => {
		const entryIds = draftSelectedRows.map((r) => r.original._id);
		if (entryIds.length === 0) {
			toast.error("Select one or more draft rows to submit");
			return;
		}
		if (entryIds.length > 500) {
			toast.error("Bulk submit allows at most 500 entries per request");
			return;
		}
		try {
			const res = await bulkSubmit.mutateAsync({ entryIds });
			const payload = res.data;
			table.resetRowSelection();
			const ok = payload.submittedCount ?? 0;
			const fail = payload.errorCount ?? 0;
			toast.success(payload.message ?? "Bulk submit completed", {
				description: `${ok} submitted${fail ? `, ${fail} failed` : ""}`,
			});
			if (payload.errors?.length) {
				const first = payload.errors[0];
				toast.message("Some entries could not be submitted", {
					description: first
						? `${first.entryId.slice(0, 8)}…: ${first.message}`
						: undefined,
				});
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	const isFiltered =
		table.getState().columnFilters.length > 0 ||
		Boolean(templateFilter) ||
		Boolean(periodFilter);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
				<div className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
					<Label htmlFor="ent-filter-emp" className="sr-only">
						Filter by employee
					</Label>
					<Input
						id="ent-filter-emp"
						placeholder="Filter by employee name…"
						value={
							(table.getColumn("employeeLabel")?.getFilterValue() as string) ??
							""
						}
						onChange={(event) =>
							table
								.getColumn("employeeLabel")
								?.setFilterValue(event.target.value)
						}
						className="w-full min-w-32"
					/>
				</div>
				<div className="grid w-full gap-2 sm:w-52">
					<Label className="text-muted-foreground text-xs">Template</Label>
					<Select
						value={templateFilter || "all"}
						onValueChange={(v) => onTemplateFilterChange(v === "all" ? "" : v)}>
						<SelectTrigger className="bg-input border-border w-full">
							<SelectValue placeholder="All templates" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All templates</SelectItem>
							{templates.map((t) => (
								<SelectItem key={t._id} value={t._id}>
									{t.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid w-full gap-2 sm:w-52">
					<Label className="text-muted-foreground text-xs">Period</Label>
					<Select
						value={periodFilter || "all"}
						onValueChange={(v) => onPeriodFilterChange(v === "all" ? "" : v)}>
						<SelectTrigger className="bg-input border-border w-full">
							<SelectValue placeholder="All periods" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All periods</SelectItem>
							{periods.map((p) => (
								<SelectItem key={p._id} value={p._id}>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						size="sm"
						className="h-10 self-end px-2 lg:px-3"
						onClick={() => {
							table.resetColumnFilters();
							onTemplateFilterChange("");
							onPeriodFilterChange("");
						}}>
						Reset
						<X className="size-4" />
					</Button>
				)}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<DataTableViewOptions table={table} />

				<Button
					type="button"
					variant="secondary"
					className="h-10"
					disabled={selectedDraftCount === 0 || bulkSubmit.isPending}
					onClick={() => void handleBulkSubmit()}>
					<Send className="size-4" aria-hidden />
					{bulkSubmit.isPending ? "Submitting…" : "Bulk submit"}
				</Button>
				<Button
					type="button"
					variant="outline"
					className="h-10"
					onClick={onBulkImport}>
					<FileUp className="size-4" aria-hidden />
					Import CSV
				</Button>
				<Button
					type="button"
					variant="outline"
					className="h-10"
					onClick={onExport}>
					<Download className="size-4" aria-hidden />
					Export
				</Button>
				<Button type="button" className="h-10" onClick={onNewDraft}>
					<Plus className="size-4" aria-hidden />
					Save draft
				</Button>
			</div>
		</div>
	);
}
