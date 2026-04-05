"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
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
import { useOrgDepartments } from "@/hooks/use-org-departments";
import {
	useCreateEmployee,
	useUpdateEmployee,
	type Employee,
} from "@/queries/employee";

type EmployeeFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial: Employee | null;
};

export function EmployeeFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
}: EmployeeFormDialogProps) {
	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const createMut = useCreateEmployee();
	const updateMut = useUpdateEmployee();

	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
		departmentId: "",
		departmentRole: "",
	});

	useEffect(() => {
		if (!open) return;
		if (mode === "create") {
			setForm({
				name: "",
				phone: "",
				email: "",
				departmentId: "",
				departmentRole: "",
			});
			return;
		}
		if (initial) {
			const deptId =
				typeof initial.department === "object" && initial.department
					? initial.department._id
					: typeof initial.department === "string"
						? initial.department
						: "";
			setForm({
				name: initial.name,
				phone: initial.phone,
				email: initial.email ?? "",
				departmentId: deptId,
				departmentRole: initial.departmentRole,
			});
		}
	}, [open, mode, initial]);

	const deptSelect = useMemo(
		() => (
			<div className="grid gap-2">
				<Label>Department</Label>
				<Select
					value={form.departmentId}
					onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
					<SelectTrigger>
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
			</div>
		),
		[form.departmentId, departments],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!form.name.trim() ||
			!form.phone.trim() ||
			!form.departmentId ||
			!form.departmentRole.trim()
		) {
			toast.error("Fill name, phone, department, and role");
			return;
		}
		try {
			if (mode === "edit" && !initial) return;
			if (mode === "create") {
				await createMut.mutateAsync({
					name: form.name.trim(),
					phone: form.phone.trim(),
					email: form.email.trim() || undefined,
					department: form.departmentId,
					departmentRole: form.departmentRole.trim(),
				});
				toast.success("Employee created");
			} else if (initial) {
				await updateMut.mutateAsync({
					id: initial._id,
					body: {
						name: form.name.trim(),
						phone: form.phone.trim(),
						email: form.email.trim() || undefined,
						department: form.departmentId,
						departmentRole: form.departmentRole.trim(),
					},
				});
				toast.success("Employee updated");
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	const busy = createMut.isPending || updateMut.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{mode === "create" ? "Add employee" : "Edit employee"}
						</DialogTitle>
						{mode === "create" ? (
							<DialogDescription>
								Phone must be unique. Role is used for KPI template matching.
							</DialogDescription>
						) : null}
					</DialogHeader>
					<div className="grid gap-2 py-4">
						<div className="grid gap-2">
							<Label htmlFor="emp-form-name">Name</Label>
							<Input
								id="emp-form-name"
								value={form.name}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="emp-form-phone">Phone</Label>
							<Input
								id="emp-form-phone"
								value={form.phone}
								onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="emp-form-email">Email</Label>
							<Input
								id="emp-form-email"
								type="email"
								value={form.email}
								onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
							/>
						</div>
						{deptLoading ? <Skeleton className="h-10 w-full" /> : deptSelect}
						<div className="grid gap-2">
							<Label htmlFor="emp-form-role">Department role</Label>
							<Input
								id="emp-form-role"
								value={form.departmentRole}
								onChange={(e) =>
									setForm((f) => ({ ...f, departmentRole: e.target.value }))
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={busy}>
							{mode === "create" ? "Create" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
