"use client";

import { type Table } from "@tanstack/react-table";
import { Download, KeyRound, Link2, Mail, Upload, X } from "lucide-react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee } from "@/queries/employee";

type EmployeeToolbarProps = {
	table: Table<Employee>;
	onAdd: () => void;
	onOpenBulkImport: () => void;
	onDownloadAllCredentials: () => void;
	onProvisionMissing: () => void;
	onOpenSendInvitations: () => void;
	onOpenSyncMembers: () => void;
	credentialsBusy?: boolean;
	searchValue: string;
	onSearchChange: (value: string) => void;
};

export function EmployeeToolbar({
	table,
	onAdd,
	onOpenBulkImport,
	onDownloadAllCredentials,
	onProvisionMissing,
	onOpenSendInvitations,
	onOpenSyncMembers,
	credentialsBusy,
	searchValue,
	onSearchChange,
}: EmployeeToolbarProps) {
	const isFiltered = Boolean(searchValue.trim());

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<Input
						placeholder="Search employees..."
						value={searchValue}
						onChange={(event) => onSearchChange(event.target.value)}
						className="w-full min-w-32 sm:max-w-sm"
					/>
					{isFiltered && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onSearchChange("")}
							className="h-8 px-2 lg:px-3">
							Reset
							<X className="size-4" />
						</Button>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<DataTableViewOptions table={table} />
					<Button
						type="button"
						disabled={credentialsBusy}
						onClick={onDownloadAllCredentials}>
						<Download className="size-4" aria-hidden />
						Download all credentials
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={credentialsBusy}
						onClick={onProvisionMissing}>
						<KeyRound className="size-4" aria-hidden />
						Provision missing
					</Button>
					<Button type="button" variant="outline" onClick={onOpenBulkImport}>
						<Upload className="size-4" aria-hidden />
						Bulk import
					</Button>
					<Button type="button" onClick={onAdd}>
						Add employee
					</Button>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2 opacity-80">
				<span className="text-muted-foreground text-xs font-medium">
					Legacy
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={credentialsBusy}
					onClick={onOpenSendInvitations}>
					<Mail className="size-4" aria-hidden />
					Send invitations
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={credentialsBusy}
					onClick={onOpenSyncMembers}>
					<Link2 className="size-4" aria-hidden />
					Sync members
				</Button>
			</div>
		</div>
	);
}
