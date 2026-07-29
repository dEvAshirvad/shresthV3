"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { KeyRound, Pencil, Trash2 } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadNodalCredentialsCsv } from "@/lib/nodal-credentials-csv";
import {
	useDeleteNodal,
	useListNodals,
	useResetNodalPassword,
	type NodalCredential,
	type NodalRecord,
} from "@/queries/nodal";
import { NodalFormDialog } from "./nodal-form-dialog";

function NodalCandidatesRowActions({
	candidate,
	onEdit,
	onCredentials,
}: {
	candidate: NodalRecord;
	onEdit: () => void;
	onCredentials?: (creds: NodalCredential[]) => void;
}) {
	const deleteNodal = useDeleteNodal();
	const resetPassword = useResetNodalPassword();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDelete = async () => {
		try {
			await deleteNodal.mutateAsync(candidate._id);
			toast.success("Nodal candidate removed");
			setConfirmOpen(false);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleReset = async () => {
		try {
			const res = await resetPassword.mutateAsync(candidate._id);
			const creds = res.data.credentials;
			onCredentials?.([creds]);
			downloadNodalCredentialsCsv([creds], `nodal-${creds.empId}-password.csv`);
			toast.success("Password reset — CSV downloaded (shown once)");
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	return (
		<>
			<div className="flex items-center gap-1">
				{candidate.empId || hasUserId(candidate) ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8"
						aria-label={`Reset password for ${candidate.name}`}
						disabled={resetPassword.isPending}
						onClick={() => void handleReset()}>
						<KeyRound className="size-4" />
					</Button>
				) : null}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8"
					aria-label={`Edit ${candidate.name}`}
					onClick={onEdit}>
					<Pencil className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8 text-destructive"
					aria-label={`Delete ${candidate.name}`}
					disabled={deleteNodal.isPending}
					onClick={() => setConfirmOpen(true)}>
					<Trash2 className="size-4" />
				</Button>
			</div>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete nodal candidate?</AlertDialogTitle>
						<AlertDialogDescription>
							This removes “{candidate.name}” from the list. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteNodal.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								void handleDelete();
							}}
							disabled={deleteNodal.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function hasUserId(n: NodalRecord): boolean {
	const u = n.userId;
	if (u == null) return false;
	if (typeof u === "string") return u.length > 0;
	if (typeof u === "object" && u !== null && "_id" in u) return true;
	return Boolean(u);
}

export function NodalCandidatesDataTable({
	onCredentials,
}: {
	onCredentials?: (creds: NodalCredential[]) => void;
} = {}) {
	const [searchInput, setSearchInput] = useState("");
	const [searchDebounced, setSearchDebounced] = useState("");
	const [createOpen, setCreateOpen] = useState(false);
	const [editNodal, setEditNodal] = useState<NodalRecord | null>(null);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

	useEffect(() => {
		const timer = setTimeout(() => setSearchDebounced(searchInput.trim()), 400);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const listParams = useMemo(
		() => ({
			page: pagination.pageIndex + 1,
			limit: pagination.pageSize,
			...(searchDebounced ? { search: searchDebounced } : {}),
		}),
		[searchDebounced, pagination.pageIndex, pagination.pageSize],
	);

	const { data, isPending, isError, error, refetch } = useListNodals(listParams);

	const docs = data?.data?.docs ?? [];

	const columns = useMemo((): ColumnDef<NodalRecord>[] => {
		return [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.getValue("name") as string}</span>
				),
			},
			{
				accessorKey: "empId",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Emp ID" />
				),
				cell: ({ row }) => (
					<span className="font-mono text-sm">
						{(row.original.empId as string) || "—"}
					</span>
				),
			},
			{
				accessorKey: "phone",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Phone" />
				),
				cell: ({ row }) => (
					<span className="font-mono text-sm">{row.getValue("phone")}</span>
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
				cell: ({ row }) => (
					<span className="text-muted-foreground max-w-[220px] truncate text-sm">
						{(row.getValue("email") as string) || "—"}
					</span>
				),
			},
			{
				id: "linked",
				header: "Provisioned",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{hasUserId(row.original) && row.original.empId ? "Yes" : "No"}
					</span>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => (
					<NodalCandidatesRowActions
						candidate={row.original}
						onEdit={() => setEditNodal(row.original)}
						onCredentials={onCredentials}
					/>
				),
			},
		];
	}, [onCredentials]);

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-48 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load nodal candidates</AlertTitle>
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
		<div className="space-y-3">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Input
					placeholder="Search name, empId, email, or phone…"
					value={searchInput}
					onChange={(e) => {
						setSearchInput(e.target.value);
						setPagination((prev) => ({ ...prev, pageIndex: 0 }));
					}}
					className="max-w-sm"
				/>
				<div className="flex items-center gap-2">
					<p className="text-muted-foreground text-sm">
						{data?.data?.total ?? 0} candidate
						{(data?.data?.total ?? 0) === 1 ? "" : "s"}
					</p>
					<Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
						Add nodal
					</Button>
				</div>
			</div>
			<DataTable
				columns={columns}
				data={docs}
				getRowId={(row) => row._id}
				pagination={{
					pageIndex: pagination.pageIndex,
					pageSize: pagination.pageSize,
					pageCount: data?.data?.totalPages ?? 1,
					totalRows: data?.data?.total ?? 0,
				}}
				onPaginationChange={setPagination}
				emptyMessage="No nodal candidates yet. Import a spreadsheet or add rows via the API."
			/>
			<NodalFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				mode="create"
				initial={null}
				onCredentials={onCredentials}
			/>
			<NodalFormDialog
				open={editNodal !== null}
				onOpenChange={(o) => !o && setEditNodal(null)}
				mode="edit"
				initial={editNodal}
			/>
		</div>
	);
}
