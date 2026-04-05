"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import { useSyncEmployeesFromOrgMembers } from "@/queries/employee";

type EmployeeSyncMembersDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EmployeeSyncMembersDialog({
	open,
	onOpenChange,
}: EmployeeSyncMembersDialogProps) {
	const [departmentId, setDepartmentId] = useState("");
	const [lastSkipped, setLastSkipped] = useState<
		{ employeeId: string; email?: string; reason: string }[]
	>([]);

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const syncMembers = useSyncEmployeesFromOrgMembers();

	const handleSync = async () => {
		if (!departmentId) {
			toast.error("Select a department");
			return;
		}
		setLastSkipped([]);
		try {
			const res = await syncMembers.mutateAsync({ departmentId });
			const { linked, skipped, message } = res.data;
			setLastSkipped(skipped ?? []);
			toast.success(message ?? "Sync completed", {
				description: `${linked} linked · ${(skipped ?? []).length} skipped`,
			});
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Sync users from org members</DialogTitle>
					<DialogDescription>
						Calls `POST /api/v1/employee/sync-from-org-members` for one
						department. Matches employee email to user+member in the active org,
						then fills `userId` and `memberId`.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="sync-dept">Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger id="sync-dept">
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									{departments.map((d) => (
										<SelectItem key={d._id} value={d._id}>
											{d.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					{lastSkipped.length > 0 ? (
						<div className="grid gap-2">
							<p className="text-muted-foreground text-sm font-medium">
								Skipped ({lastSkipped.length})
							</p>
							<ScrollArea className="h-40 rounded-md border p-2 text-sm">
								<ul className="space-y-2">
									{lastSkipped.map((s, i) => (
										<li key={`${s.employeeId}-${i}`}>
											<span className="text-muted-foreground font-mono text-xs">
												{s.email || s.employeeId}
											</span>
											{" — "}
											{s.reason}
										</li>
									))}
								</ul>
							</ScrollArea>
						</div>
					) : null}
				</div>
				<DialogFooter className="gap-2 sm:justify-between">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button
						type="button"
						disabled={syncMembers.isPending || !departmentId}
						onClick={() => void handleSync()}>
						{syncMembers.isPending ? "Syncing…" : "Sync now"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
