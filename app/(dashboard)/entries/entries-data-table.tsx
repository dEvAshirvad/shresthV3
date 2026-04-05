"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useListEmployees } from "@/queries/employee";
import {
	useDeleteDraftEntry,
	useListEntries,
	useSubmitKpiEntry,
	type KpiEntry,
} from "@/queries/entries";
import { useListKpiPeriods } from "@/queries/periods";
import { useListTemplates } from "@/queries/templates";

import { getEntryColumns } from "./columns";
import { EntriesBulkImportDialog } from "./entries-bulk-import-dialog";
import { EntriesExportDialog } from "./entries-export-dialog";
import { EntriesToolbar } from "./entries-toolbar";
import { EntryDetailPanel } from "./entry-detail-panel";
import { EntryDraftDialog } from "./entry-draft-dialog";
import { mapEntryToRow, type EntryTableRow } from "./map-entry-row";

export function EntriesDataTable() {
	const [templateFilter, setTemplateFilter] = useState("");
	const [periodFilter, setPeriodFilter] = useState("");
	const [draftOpen, setDraftOpen] = useState(false);
	const [bulkOpen, setBulkOpen] = useState(false);
	const [exportOpen, setExportOpen] = useState(false);
	const [detailEntry, setDetailEntry] = useState<EntryTableRow | null>(null);

	const listParams = useMemo(
		() => ({
			page: 1,
			limit: 100,
			...(templateFilter ? { templateId: templateFilter } : {}),
			...(periodFilter ? { periodId: periodFilter } : {}),
		}),
		[templateFilter, periodFilter],
	);

	const { data: listRes, isPending, isError, error, refetch } =
		useListEntries(listParams);

	const { data: tplRes } = useListTemplates({ page: 1, limit: 200 });
	const templates = tplRes?.data?.docs ?? [];

	const { data: empRes } = useListEmployees({ page: 1, limit: 500 });
	const employees = empRes?.data?.docs ?? [];

	const { data: periodRes } = useListKpiPeriods({ page: 1, limit: 100 });
	const periods = periodRes?.data?.docs ?? [];

	const templateNameById = useMemo(() => {
		const m = new Map<string, string>();
		for (const t of templates) m.set(t._id, t.name);
		return m;
	}, [templates]);

	const employeeNameById = useMemo(() => {
		const m = new Map<string, string>();
		for (const e of employees) m.set(e._id, e.name);
		return m;
	}, [employees]);

	const periodNameById = useMemo(() => {
		const m = new Map<string, string>();
		for (const p of periods) m.set(p._id, p.name);
		return m;
	}, [periods]);

	const entries = listRes?.data?.docs ?? [];

	const rows = useMemo(
		() =>
			entries.map((en) =>
				mapEntryToRow(en, {
					templateNameById,
					employeeNameById,
					periodNameById,
				}),
			),
		[entries, templateNameById, employeeNameById, periodNameById],
	);

	const submitEntry = useSubmitKpiEntry();
	const deleteDraft = useDeleteDraftEntry();

	const handleSubmit = useCallback(
		async (entry: KpiEntry) => {
			try {
				await submitEntry.mutateAsync(entry._id);
				toast.success("Entry submitted");
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[submitEntry],
	);

	const handleDelete = useCallback(
		async (entry: KpiEntry) => {
			try {
				await deleteDraft.mutateAsync(entry._id);
				toast.success("Draft deleted");
				if (detailEntry?._id === entry._id) setDetailEntry(null);
			} catch (err) {
				toast.error(getApiErrorMessage(err));
			}
		},
		[deleteDraft, detailEntry?._id],
	);

	const handleView = useCallback((row: EntryTableRow) => {
		setDetailEntry((prev) => (prev?._id === row._id ? null : row));
	}, []);

	const columns = useMemo(
		() =>
			getEntryColumns({
				onView: handleView,
				onSubmit: (row: EntryTableRow) => void handleSubmit(row),
				onDelete: (row: EntryTableRow) => void handleDelete(row),
				submitPending: submitEntry.isPending,
				deletePending: deleteDraft.isPending,
			}),
		[
			handleView,
			handleSubmit,
			handleDelete,
			submitEntry.isPending,
			deleteDraft.isPending,
		],
	);

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load entries</AlertTitle>
				<AlertDescription className="flex flex-col gap-2">
					<span>{error instanceof Error ? error.message : "Request failed"}</span>
					<button
						type="button"
						className="text-sm underline"
						onClick={() => void refetch()}>
						Retry
					</button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(row) => row._id}
				defaultPageSize={10}
				emptyMessage="No KPI entries yet. Save a draft or run a bulk import."
				getRowClassName={(row) =>
					detailEntry?._id === row._id ? "bg-muted/40" : undefined
				}
				renderToolbar={(table) => (
					<EntriesToolbar
						table={table}
						onNewDraft={() => setDraftOpen(true)}
						onBulkImport={() => setBulkOpen(true)}
						onExport={() => setExportOpen(true)}
						templateFilter={templateFilter}
						onTemplateFilterChange={setTemplateFilter}
						periodFilter={periodFilter}
						onPeriodFilterChange={setPeriodFilter}
						templates={templates}
						periods={periods}
					/>
				)}
			/>

			{detailEntry && (
				<EntryDetailPanel
					entryId={detailEntry._id}
					employeeLabel={detailEntry.employeeLabel}
					templateLabel={detailEntry.templateLabel}
					periodLabel={detailEntry.periodLabel}
					onClear={() => setDetailEntry(null)}
				/>
			)}

			<EntryDraftDialog open={draftOpen} onOpenChange={setDraftOpen} />
			<EntriesBulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
			<EntriesExportDialog open={exportOpen} onOpenChange={setExportOpen} />
		</div>
	);
}
