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
import { downloadNodalCredentialsCsv } from "@/lib/nodal-credentials-csv";
import {
	useCreateNodal,
	useUpdateNodal,
	type NodalCredential,
	type NodalRecord,
} from "@/queries/nodal";

type NodalFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial: NodalRecord | null;
	onCredentials?: (creds: NodalCredential[]) => void;
};

export function NodalFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
	onCredentials,
}: NodalFormDialogProps) {
	const createMut = useCreateNodal();
	const updateMut = useUpdateNodal();

	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
	});
	const [createdCreds, setCreatedCreds] = useState<NodalCredential | null>(
		null,
	);

	useEffect(() => {
		if (!open) return;
		setCreatedCreds(null);
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
				const res = await createMut.mutateAsync({
					name: form.name.trim(),
					phone: form.phone.trim(),
					email: form.email.trim() || undefined,
				});
				const creds = res.data.credentials;
				if (creds) {
					setCreatedCreds(creds);
					onCredentials?.([creds]);
					downloadNodalCredentialsCsv(
						[creds],
						`nodal-${creds.empId}-credentials.csv`,
					);
					toast.success("Nodal created — credentials downloaded (shown once)");
				} else {
					toast.success("Nodal candidate created");
					onOpenChange(false);
				}
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
				onOpenChange(false);
			}
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				{createdCreds ? (
					<>
						<DialogHeader>
							<DialogTitle>Credentials created</DialogTitle>
							<DialogDescription>
								Save these now — the password cannot be retrieved later (use
								reset to generate a new one).
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2 py-2 font-mono text-sm">
							<p>
								<span className="text-muted-foreground">Emp ID: </span>
								{createdCreds.empId}
							</p>
							<p>
								<span className="text-muted-foreground">Password: </span>
								{createdCreds.password}
							</p>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() =>
									downloadNodalCredentialsCsv(
										[createdCreds],
										`nodal-${createdCreds.empId}-credentials.csv`,
									)
								}>
								Download CSV
							</Button>
							<Button type="button" onClick={() => onOpenChange(false)}>
								Done
							</Button>
						</DialogFooter>
					</>
				) : (
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle>
								{mode === "create"
									? "Add nodal candidate"
									: "Edit nodal candidate"}
							</DialogTitle>
							<DialogDescription>
								{mode === "create"
									? "Creates the nodal and provisions Emp ID + password immediately."
									: "Update name, phone, or email."}
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-3 py-4">
							<div className="grid gap-2">
								<Label htmlFor="nodal-form-name">Name</Label>
								<Input
									id="nodal-form-name"
									value={form.name}
									onChange={(e) =>
										setForm((f) => ({ ...f, name: e.target.value }))
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="nodal-form-phone">Phone</Label>
								<Input
									id="nodal-form-phone"
									value={form.phone}
									onChange={(e) =>
										setForm((f) => ({ ...f, phone: e.target.value }))
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="nodal-form-email">Email (optional)</Label>
								<Input
									id="nodal-form-email"
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm((f) => ({ ...f, email: e.target.value }))
									}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button type="submit" disabled={busy}>
								{mode === "create" ? "Create & provision" : "Save"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
