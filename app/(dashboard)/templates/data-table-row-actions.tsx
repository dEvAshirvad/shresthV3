"use client";

import { type Row } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useDeleteTemplate } from "@/queries/templates";

import type { TemplateTableRow } from "./map-template-row";

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

type TemplateDataTableRowActionsProps = {
	row: Row<TemplateTableRow>;
};

export function TemplateDataTableRowActions({
	row,
}: TemplateDataTableRowActionsProps) {
	const tpl = row.original;
	const deleteTemplate = useDeleteTemplate();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDelete = async () => {
		try {
			await deleteTemplate.mutateAsync(tpl._id);
			toast.success("Template deleted");
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
				<DropdownMenuContent align="end" className="w-[160px]">
					<DropdownMenuItem asChild>
						<Link
							href={`/templates/${tpl._id}/edit`}
							className="flex cursor-pointer items-center gap-2">
							<Pencil className="size-4" />
							Edit
						</Link>
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

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete template?</AlertDialogTitle>
						<AlertDialogDescription>
							Remove &quot;{tpl.name}&quot;? Entries that reference this template
							are not removed automatically.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteTemplate.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								void handleDelete();
							}}
							disabled={deleteTemplate.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
