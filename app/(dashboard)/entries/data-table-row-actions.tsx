"use client";

import { type Row } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { EntryTableRow } from "./map-entry-row";

type EntryDataTableRowActionsProps = {
	row: Row<EntryTableRow>;
	onView: () => void;
	onSubmit: () => void;
	onDelete: () => void;
	submitPending: boolean;
	deletePending: boolean;
};

export function EntryDataTableRowActions({
	row,
	onView,
	onSubmit,
	onDelete,
	submitPending,
	deletePending,
}: EntryDataTableRowActionsProps) {
	const entry = row.original;
	const isDraft = entry.status === "draft";

	return (
		<div className="flex items-center justify-end gap-1">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="size-8"
				title="Show line items below"
				onClick={onView}>
				<Eye className="size-4" />
				<span className="sr-only">View</span>
			</Button>
			{isDraft ? (
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
						<DropdownMenuItem
							className="gap-2"
							disabled={submitPending}
							onClick={onSubmit}>
							<Send className="size-4" />
							Submit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive focus:text-destructive gap-2"
							disabled={deletePending}
							onClick={onDelete}>
							<Trash2 className="size-4" />
							Delete draft
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : null}
		</div>
	);
}
