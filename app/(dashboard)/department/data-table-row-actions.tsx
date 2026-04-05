"use client";

import { type Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pencil, Trash2, UserCog } from "lucide-react";
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
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteDepartment } from "@/queries/departments";

import type { DepartmentTableRow } from "./columns";

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

type DataTableRowActionsProps = {
	row: Row<DepartmentTableRow>;
	onEdit: () => void;
	onAssignNodal: () => void;
};

export function DataTableRowActions({
	row,
	onEdit,
	onAssignNodal,
}: DataTableRowActionsProps) {
	const dept = row.original;
	const deleteDept = useDeleteDepartment();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDelete = async () => {
		try {
			await deleteDept.mutateAsync(dept.id);
			toast.success("Department deleted");
			setConfirmOpen(false);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	return (
		<>
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
					<DropdownMenuItem className="gap-2" onClick={onAssignNodal}>
						<UserCog className="size-4" />
						Assign nodal
					</DropdownMenuItem>
					<DropdownMenuItem className="gap-2" onClick={onEdit}>
						<Pencil className="size-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="gap-2"
						onClick={() => {
							void navigator.clipboard.writeText(dept.id);
							toast.success("Department ID copied");
						}}>
						<Copy className="size-4" />
						Copy ID
						<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="gap-2 text-destructive focus:text-destructive"
						onClick={() => setConfirmOpen(true)}>
						<Trash2 className="size-4" />
						Delete
						<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete department?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove &quot;{dept.name}&quot; for your organization.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteDept.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								void handleDelete();
							}}
							disabled={deleteDept.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
