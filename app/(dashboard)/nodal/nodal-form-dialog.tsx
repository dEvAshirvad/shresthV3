"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import {
	useCreateNodal,
	useUpdateNodal,
	type NodalRecord,
} from "@/queries/nodal";

type NodalFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial: NodalRecord | null;
};

export function NodalFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
}: NodalFormDialogProps) {
	const createMut = useCreateNodal();
	const updateMut = useUpdateNodal();

	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		if (!open) return;
		if (mode === "create") {
			setForm({ name: "", phone: "", email: "" });
			return;
		}
		if (initial) {
			setForm({
				name: initial.name,
				phone: initial.phone,
				email: initial.email ?? "",
			});
		}
	}, [open, mode, initial]);

	const busy = createMut.isPending || updateMut.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim() || !form.phone.trim()) {
			toast.error("Name and phone are required");
			return;
		}

		try {
			if (mode === "create") {
				await createMut.mutateAsync({
					name: form.name.trim(),
					phone: form.phone.trim(),
					email: form.email.trim() || undefined,
				});
				toast.success("Nodal candidate created");
			} else {
				if (!initial) return;
				await updateMut.mutateAsync({
					id: initial._id,
					body: {
						name: form.name.trim(),
						phone: form.phone.trim(),
						email: form.email.trim() || undefined,
					},
				});
				toast.success("Nodal candidate updated");
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{mode === "create" ? "Add nodal candidate" : "Edit nodal candidate"}
						</DialogTitle>
						<DialogDescription>
							Nodal rows are organization-scoped and use name, phone, and optional
							email.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3 py-4">
						<div className="grid gap-2">
							<Label htmlFor="nodal-form-name">Name</Label>
							<Input
								id="nodal-form-name"
								value={form.name}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="nodal-form-phone">Phone</Label>
							<Input
								id="nodal-form-phone"
								value={form.phone}
								onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="nodal-form-email">Email (optional)</Label>
							<Input
								id="nodal-form-email"
								type="email"
								value={form.email}
								onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
