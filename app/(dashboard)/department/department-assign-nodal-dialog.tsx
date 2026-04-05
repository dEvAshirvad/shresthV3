"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useListOrganizationMembers } from "@/queries/auth";
import { useAssignDepartmentNodal } from "@/queries/departments";

type DepartmentAssignNodalDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	departmentId: string;
	departmentName: string;
};

export function DepartmentAssignNodalDialog({
	open,
	onOpenChange,
	departmentId,
	departmentName,
}: DepartmentAssignNodalDialogProps) {
	const { data, isPending, isError } = useListOrganizationMembers({});
	const members = data?.members ?? [];

	const assignNodal = useAssignDepartmentNodal();
	const [memberId, setMemberId] = useState("");

	useEffect(() => {
		if (!open) setMemberId("");
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!memberId) {
			toast.error("Select an organization member");
			return;
		}
		try {
			await assignNodal.mutateAsync({
				id: departmentId,
				body: { assignedNodal: memberId },
			});
			toast.success("Nodal assigned");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Assign nodal</DialogTitle>
					<DialogDescription>
						Choose an organization member to own KPI work for{" "}
						<strong>{departmentName}</strong>. Members must already belong to
						this organization — invite people from{" "}
						<Link
							href="/nodal"
							className="text-primary underline underline-offset-2">
							Nodal &amp; Admin
						</Link>
						.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 p-4">
						{isPending && <Skeleton className="h-10 w-full" />}
						{isError && (
							<p className="text-destructive text-sm">
								Could not load members. Check your session and try again.
							</p>
						)}
						{!isPending && !isError && (
							<div className="grid gap-2">
								<Label htmlFor="assign-member">Member</Label>
								<Select value={memberId} onValueChange={setMemberId}>
									<SelectTrigger id="assign-member">
										<SelectValue placeholder="Select member" />
									</SelectTrigger>
									<SelectContent>
										{members.map((m) => (
											<SelectItem key={m.id} value={m.id}>
												{m.user?.name ?? m.userId}{" "}
												<span className="text-muted-foreground">
													({m.role}) · {m.user?.email ?? "—"}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{members.length === 0 && (
									<p className="text-muted-foreground text-xs">
										No members yet. Invite someone first.
									</p>
								)}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={assignNodal.isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={assignNodal.isPending || !memberId}>
							Assign
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
