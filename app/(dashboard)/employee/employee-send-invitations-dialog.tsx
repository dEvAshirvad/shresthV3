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
import { useSendInvitationToRestEmployees } from "@/queries/employee";

type EmployeeSendInvitationsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EmployeeSendInvitationsDialog({
	open,
	onOpenChange,
}: EmployeeSendInvitationsDialogProps) {
	const [departmentId, setDepartmentId] = useState("");
	const [lastErrors, setLastErrors] = useState<
		{ employeeId: string; email: string; message: string }[]
	>([]);

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const sendInvites = useSendInvitationToRestEmployees();

	const handleSend = async () => {
		if (!departmentId) {
			toast.error("Select a department");
			return;
		}
		setLastErrors([]);
		try {
			const res = await sendInvites.mutateAsync({ departmentId });
			const { message, errors } = res.data;
			setLastErrors(errors ?? []);
			if (errors?.length) {
				toast.message(message ?? "Some invitations could not be sent", {
					description: `${errors.length} error(s) — see list below.`,
				});
			} else {
				toast.success(message ?? "Invitations processed");
				onOpenChange(false);
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Send invitations</DialogTitle>
					<DialogDescription>
						For the selected department, emails pending invitations and sends new
						ones for staff with a valid email who are not yet linked to a user.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="invite-dept">Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger id="invite-dept">
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
					{lastErrors.length > 0 ? (
						<div className="grid gap-2">
							<p className="text-destructive text-sm font-medium">
								Issues ({lastErrors.length})
							</p>
							<ScrollArea className="h-40 rounded-md border p-2 text-sm">
								<ul className="space-y-2">
									{lastErrors.map((err, i) => (
										<li key={`${err.employeeId}-${i}`}>
											<span className="text-muted-foreground font-mono text-xs">
												{err.email || err.employeeId}
											</span>
											{" — "}
											{err.message}
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
						disabled={sendInvites.isPending || !departmentId}
						onClick={() => void handleSend()}>
						{sendInvites.isPending ? "Sending…" : "Send / resend"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
