"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

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
	useCreateDepartment,
	useUpdateDepartment,
} from "@/queries/departments";

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

type DepartmentFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial?: DepartmentTableRow | null;
};

export function DepartmentFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
}: DepartmentFormDialogProps) {
	const createDept = useCreateDepartment();
	const updateDept = useUpdateDepartment();

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");

	useEffect(() => {
		if (!open) return;
		if (mode === "edit" && initial) {
			setName(initial.name);
			setSlug(initial.slug);
		} else {
			setName("");
			setSlug("");
		}
	}, [open, mode, initial]);

	const busy = createDept.isPending || updateDept.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const n = name.trim();
		const s = slug.trim();
		if (!n || !s) {
			toast.error("Name and slug are required");
			return;
		}
		try {
			if (mode === "create") {
				await createDept.mutateAsync({ name: n, slug: s });
				toast.success("Department created");
			} else if (initial) {
				await updateDept.mutateAsync({
					id: initial.id,
					body: { name: n, slug: s },
				});
				toast.success("Department updated");
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{mode === "create" ? "Add department" : "Edit department"}
						</DialogTitle>
						<DialogDescription>
							Departments are scoped to your active organization.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="dept-name">Name</Label>
							<Input
								id="dept-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Finance"
								autoComplete="off"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="dept-slug">Slug</Label>
							<Input
								id="dept-slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="finance"
								autoComplete="off"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={busy}>
							Cancel
						</Button>
						<Button type="submit" disabled={busy}>
							{mode === "create" ? "Create" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
