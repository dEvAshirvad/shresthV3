"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgDepartments } from "@/hooks/use-org-departments";

import { getDepartmentColumns, type DepartmentTableRow } from "./columns";
import { DepartmentAssignNodalDialog } from "./department-assign-nodal-dialog";
import { DepartmentFormDialog } from "./department-form-dialog";
import { DepartmentToolbar } from "./department-toolbar";
import { mapDepartmentToRow } from "./map-department";

export function DepartmentDataTable() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editRow, setEditRow] = useState<DepartmentTableRow | null>(null);
	const [assignRow, setAssignRow] = useState<DepartmentTableRow | null>(null);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
	const [searchInput, setSearchInput] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchInput.trim()), 400);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const { data, isPending, isError, error, refetch } = useOrgDepartments({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		...(searchDebounced ? { search: searchDebounced } : {}),
	});

	const rows = useMemo(() => {
		const docs = data?.data?.docs;
		if (!docs?.length) return [];
		return docs.map(mapDepartmentToRow);
	}, [data]);

	const columns = useMemo(
		() =>
			getDepartmentColumns({
				onEdit: (row) => setEditRow(row),
				onAssignNodal: (row) => setAssignRow(row),
			}),
		[],
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
				<AlertTitle>Could not load departments</AlertTitle>
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
		<>
			<DataTable
				columns={columns}
				data={rows}
				getRowId={(row) => row.id}
				initialColumnVisibility={{ nodalStatus: false }}
				pagination={{
					pageIndex: pagination.pageIndex,
					pageSize: pagination.pageSize,
					pageCount: data?.data?.totalPages ?? 1,
					totalRows: data?.data?.total ?? 0,
				}}
				onPaginationChange={setPagination}
				emptyMessage="No departments yet. Add one to get started."
				renderToolbar={(table) => (
					<DepartmentToolbar
						table={table}
						onAdd={() => setCreateOpen(true)}
						searchValue={searchInput}
						onSearchChange={(next) => {
							setSearchInput(next);
							setPagination((prev) => ({ ...prev, pageIndex: 0 }));
						}}
					/>
				)}
			/>
			<DepartmentFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
			/>
			<DepartmentFormDialog
				open={editRow !== null}
				onOpenChange={(o) => !o && setEditRow(null)}
				mode="edit"
				initial={editRow ?? undefined}
			/>
			<DepartmentAssignNodalDialog
				open={assignRow !== null}
				onOpenChange={(o) => !o && setAssignRow(null)}
				departmentId={assignRow?.id ?? ""}
				departmentName={assignRow?.name ?? ""}
			/>
		</>
	);
}
