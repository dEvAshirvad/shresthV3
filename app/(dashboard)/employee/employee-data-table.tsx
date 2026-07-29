"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadEmployeeCredentialsCsv } from "@/lib/employee-credentials-csv";
import {
	useDownloadAllEmployeeCredentials,
	useListEmployees,
	useProvisionEmployeeCredentials,
	type Employee,
} from "@/queries/employee";

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
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
	const [searchInput, setSearchInput] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");

	const provisionMut = useProvisionEmployeeCredentials();
	const downloadAllMut = useDownloadAllEmployeeCredentials();

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchInput.trim()), 400);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const { data, isPending, isError, error, refetch } = useListEmployees({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		...(searchDebounced ? { search: searchDebounced } : {}),
	});

	const employees = data?.data?.docs ?? [];

	const columns = useMemo(
		() =>
			getEmployeeColumns({
				onEdit: (row) => setEditEmp(row),
			}),
		[],
	);

	const credentialsBusy =
		provisionMut.isPending || downloadAllMut.isPending;

	const handleProvision = () => {
		provisionMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				const creds = d.credentials ?? [];
				const errCount = d.errors?.length ?? 0;
				toast.success(d.message ?? "Provisioning completed", {
					description: `${creds.length} credential(s)${errCount ? ` · ${errCount} errors` : ""}`,
				});
				if (creds.length) {
					downloadEmployeeCredentialsCsv(creds);
					toast.message("Credentials CSV downloaded — save it securely.");
				}
			},
			onError: (e) => toast.error(getApiErrorMessage(e)),
		});
	};

	const handleDownloadAll = () => {
		downloadAllMut.mutate(undefined, {
			onSuccess: (res) => {
				const d = res.data;
				const creds = d.credentials ?? [];
				const errCount = d.errors?.length ?? 0;
				toast.success(d.message ?? "Credentials ready", {
					description: `${creds.length}/${d.total ?? creds.length} credential(s)${errCount ? ` · ${errCount} errors` : ""}`,
				});
				if (creds.length) {
					downloadEmployeeCredentialsCsv(
						creds,
						`employee-credentials-all-${new Date().toISOString().slice(0, 10)}.csv`,
					);
				}
			},
			onError: (e) => toast.error(getApiErrorMessage(e)),
		});
	};

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
				pagination={{
					pageIndex: pagination.pageIndex,
					pageSize: pagination.pageSize,
					pageCount: data?.data?.totalPages ?? 1,
					totalRows: data?.data?.total ?? 0,
				}}
				onPaginationChange={setPagination}
				emptyMessage="No employees yet. Add one or use bulk import."
				renderToolbar={(table) => (
					<EmployeeToolbar
						table={table}
						onAdd={() => setCreateOpen(true)}
						onOpenBulkImport={() => setBulkImportOpen(true)}
						onDownloadAllCredentials={handleDownloadAll}
						onProvisionMissing={handleProvision}
						onOpenSendInvitations={() => setSendInvOpen(true)}
						onOpenSyncMembers={() => setSyncOpen(true)}
						credentialsBusy={credentialsBusy}
						searchValue={searchInput}
						onSearchChange={(next) => {
							setSearchInput(next);
							setPagination((prev) => ({ ...prev, pageIndex: 0 }));
						}}
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
