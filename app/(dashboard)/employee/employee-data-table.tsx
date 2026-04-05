"use client";

import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useListEmployees } from "@/queries/employee";
import type { Employee } from "@/queries/employee";

import { getEmployeeColumns } from "./columns";
import { EmployeeBulkImportDialog } from "./employee-bulk-import-dialog";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeeSendInvitationsDialog } from "./employee-send-invitations-dialog";
import { EmployeeSyncMembersDialog } from "./employee-sync-members-dialog";
import { EmployeeToolbar } from "./employee-toolbar";

export function EmployeeDataTable() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editEmp, setEditEmp] = useState<Employee | null>(null);
	const [bulkImportOpen, setBulkImportOpen] = useState(false);
	const [sendInvOpen, setSendInvOpen] = useState(false);
	const [syncOpen, setSyncOpen] = useState(false);

	const { data, isPending, isError, error, refetch } = useListEmployees({
		page: 1,
		limit: 100,
	});

	const employees = data?.data?.docs ?? [];

	const columns = useMemo(
		() =>
			getEmployeeColumns({
				onEdit: (row) => setEditEmp(row),
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
				<AlertTitle>Could not load employees</AlertTitle>
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
				data={employees}
				getRowId={(row) => row._id}
				defaultPageSize={10}
				emptyMessage="No employees yet. Add one or use bulk import."
				renderToolbar={(table) => (
					<EmployeeToolbar
						table={table}
						onAdd={() => setCreateOpen(true)}
						onOpenBulkImport={() => setBulkImportOpen(true)}
						onOpenSendInvitations={() => setSendInvOpen(true)}
						onOpenSyncMembers={() => setSyncOpen(true)}
					/>
				)}
			/>
			<EmployeeFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				initial={null}
			/>
			<EmployeeFormDialog
				open={editEmp !== null}
				onOpenChange={(o) => !o && setEditEmp(null)}
				mode="edit"
				initial={editEmp}
			/>
			<EmployeeBulkImportDialog
				open={bulkImportOpen}
				onOpenChange={setBulkImportOpen}
			/>
			<EmployeeSendInvitationsDialog
				open={sendInvOpen}
				onOpenChange={setSendInvOpen}
			/>
			<EmployeeSyncMembersDialog open={syncOpen} onOpenChange={setSyncOpen} />
		</>
	);
}
