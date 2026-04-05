"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import { useCreateTemplate } from "@/queries/templates";

import { TemplateItemEditor } from "./template-item-editor";
import {
	createEmptyDraftItem,
	draftsToKpiTemplateItems,
	type DraftTemplateItem,
} from "./template-draft-utils";

export function TemplateCreateForm() {
	const router = useRouter();
	const { session } = useAuth();
	const orgId = session?.activeOrganizationId ?? "";

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const createMut = useCreateTemplate();

	const [name, setName] = useState("");
	const [role, setRole] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [description, setDescription] = useState("");
	const [items, setItems] = useState<DraftTemplateItem[]>(() => [
		createEmptyDraftItem("percent"),
	]);

	const updateItem = (localId: string, next: DraftTemplateItem) => {
		setItems((prev) => prev.map((it) => (it.localId === localId ? next : it)));
	};

	const removeItem = (localId: string) => {
		setItems((prev) => prev.filter((it) => it.localId !== localId));
	};

	const addItem = () => {
		setItems((prev) => [...prev, createEmptyDraftItem("percent")]);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!orgId) {
			toast.error("No active organization");
			return;
		}
		if (!name.trim() || !role.trim() || !departmentId) {
			toast.error("Name, role, and department are required");
			return;
		}
		const built = draftsToKpiTemplateItems(items);
		if (!built.ok) {
			toast.error(built.message);
			return;
		}
		try {
			await createMut.mutateAsync({
				organizationId: orgId,
				departmentId,
				role: role.trim(),
				name: name.trim(),
				description: description.trim() || undefined,
				items: built.items,
			});
			toast.success("Template created");
			router.push("/templates");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	if (!orgId) {
		return (
			<p className="text-muted-foreground text-sm">
				Select an active organization before creating a template.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<Alert className="p-4">
				<AlertTitle>Before you save</AlertTitle>
				<AlertDescription className="text-muted-foreground space-y-2 text-sm leading-relaxed">
					<p>
						At least one employee in the chosen department must have a{" "}
						<code className="rounded bg-muted px-1 text-xs">
							departmentRole
						</code>{" "}
						that matches this template&apos;s role (case-insensitive), or the
						server returns{" "}
						<code className="rounded bg-muted px-1 text-xs">
							INVALID_ROLE_FOR_DEPARTMENT
						</code>
						.
					</p>
					<p>
						Each line item must pair{" "}
						<code className="rounded bg-muted px-1 text-xs">inputType</code>{" "}
						with the matching judgement type (see scoring rule per item below).
					</p>
				</AlertDescription>
			</Alert>

			<div className="space-y-4">
				<h2 className="text-foreground text-sm font-semibold tracking-tight">
					Template details
				</h2>
				<div className="grid max-w-2xl gap-4">
					<div className="grid gap-2">
						<Label htmlFor="tc-name">Name</Label>
						<Input
							id="tc-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Q1 Sales KPI"
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="tc-role">Role</Label>
						<Input
							id="tc-role"
							value={role}
							onChange={(e) => setRole(e.target.value)}
							placeholder="Must match an employee department role in this dept."
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label>Department</Label>
						{deptLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={departmentId} onValueChange={setDepartmentId}>
								<SelectTrigger className="w-full">
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
					<div className="grid gap-2">
						<Label htmlFor="tc-desc">Description (optional)</Label>
						<Textarea
							id="tc-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-foreground text-sm font-semibold tracking-tight">
						KPI line items
					</h2>
					<Button type="button" variant="secondary" size="sm" onClick={addItem}>
						Add line item
					</Button>
				</div>
				<div className="space-y-6">
					{items.map((item, index) => (
						<TemplateItemEditor
							key={item.localId}
							item={item}
							index={index}
							onChange={(next) => updateItem(item.localId, next)}
							onRemove={() => removeItem(item.localId)}
							canRemove={items.length > 1}
						/>
					))}
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				<Button type="submit" disabled={createMut.isPending}>
					{createMut.isPending ? "Creating…" : "Create template"}
				</Button>
				<Button type="button" variant="outline" asChild>
					<Link href="/templates">Cancel</Link>
				</Button>
			</div>
		</form>
	);
}
