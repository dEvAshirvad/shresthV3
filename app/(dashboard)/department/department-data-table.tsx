"use client";

import { useMemo, useState } from "react";

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

	const { data, isPending, isError, error, refetch } = useOrgDepartments({
		page: 1,
		limit: 100,
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
				defaultPageSize={10}
				emptyMessage="No departments yet. Add one to get started."
				renderToolbar={(table) => (
					<DepartmentToolbar
						table={table}
						onAdd={() => setCreateOpen(true)}
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
