"use client";

import { type Row } from "@tanstack/react-table";
import { KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadEmployeeCredentialsCsv } from "@/lib/employee-credentials-csv";
import type { Employee } from "@/queries/employee";
import {
	useDeleteEmployee,
	useResetEmployeePassword,
} from "@/queries/employee";

function getApiErrorMessage(err: unknown): string {
	if (isAxiosError(err)) {
		const data = err.response?.data as
			| { message?: string; title?: string }
			| undefined;
		return data?.message ?? data?.title ?? err.message ?? "Request failed";
	}
	if (err instanceof Error) return err.message;
	return "Something went wrong";
}

function hasUserId(emp: Employee): boolean {
	return Boolean(emp.userId);
}

function isProvisioned(emp: Employee): boolean {
	return Boolean(emp.empId) && hasUserId(emp);
}

type EmployeeDataTableRowActionsProps = {
	row: Row<Employee>;
	onEdit: () => void;
};

export function EmployeeDataTableRowActions({
	row,
	onEdit,
}: EmployeeDataTableRowActionsProps) {
	const emp = row.original;
	const deleteEmployee = useDeleteEmployee();
	const resetPassword = useResetEmployeePassword();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const provisioned = isProvisioned(emp);

	const handleDelete = async () => {
		try {
			await deleteEmployee.mutateAsync(emp._id);
			toast.success("Employee deleted");
			setConfirmOpen(false);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleProvisionOrReset = async () => {
		try {
			const res = await resetPassword.mutateAsync(emp._id);
			const creds = res.data.credentials;
			downloadEmployeeCredentialsCsv(
				[creds],
				`employee-${creds.empId}-password.csv`,
			);
			toast.success(
				provisioned
					? "Password reset — CSV downloaded (shown once)"
					: "Credentials provisioned — CSV downloaded (shown once)",
			);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	return (
		<>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8"
					aria-label={
						provisioned
							? `Reset password for ${emp.name}`
							: `Provision credentials for ${emp.name}`
					}
					title={provisioned ? "Reset password" : "Provision credentials"}
					disabled={resetPassword.isPending}
					onClick={() => void handleProvisionOrReset()}>
					<KeyRound className="size-4" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 data-[state=open]:bg-muted">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[200px]">
						<DropdownMenuItem
							className="gap-2"
							disabled={resetPassword.isPending}
							onClick={() => void handleProvisionOrReset()}>
							<KeyRound className="size-4" />
							{provisioned ? "Reset password" : "Provision credentials"}
						</DropdownMenuItem>
						<DropdownMenuItem className="gap-2" onClick={onEdit}>
							<Pencil className="size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="gap-2 text-destructive focus:text-destructive"
							onClick={() => setConfirmOpen(true)}>
							<Trash2 className="size-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete employee?</AlertDialogTitle>
						<AlertDialogDescription>
							This removes {emp.name} from the directory.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteEmployee.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								void handleDelete();
							}}
							disabled={deleteEmployee.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
