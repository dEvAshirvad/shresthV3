"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import type { Department } from "@/queries/departments";
import { useTemplate, useUpdateTemplate, type KpiTemplate } from "@/queries/templates";

import { TemplateItemEditor } from "./template-item-editor";
import {
	createEmptyDraftItem,
	draftsToKpiTemplateItems,
	kpiTemplateItemsToDrafts,
	type DraftTemplateItem,
} from "./template-draft-utils";

type TemplateEditFormProps = {
	templateId: string;
};

/** API may return a string id, ObjectId-like `{ $oid }`, or a populated `{ _id, name? }` ref. */
function normalizeDepartmentId(raw: unknown): string {
	if (raw == null) return "";
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "object" && raw !== null) {
		if ("$oid" in raw && typeof (raw as { $oid?: unknown }).$oid === "string") {
			return (raw as { $oid: string }).$oid.trim();
		}
		if ("_id" in raw) {
			const id = (raw as { _id?: unknown })._id;
			if (typeof id === "string") return id.trim();
			if (id && typeof id === "object" && id !== null && "$oid" in id) {
				return String((id as { $oid: string }).$oid).trim();
			}
		}
	}
	return "";
}

function labelForMissingDepartmentOption(
	template: KpiTemplate | undefined,
	id: string,
): string {
	const raw = template?.departmentId as unknown;
	if (raw && typeof raw === "object" && raw !== null && "name" in raw) {
		const n = (raw as { name?: unknown }).name;
		if (typeof n === "string" && n.trim()) return n;
	}
	return `Department (${id.slice(0, 8)}…)`;
}

function TemplateEditFormBody({ template }: { template: KpiTemplate }) {
	const router = useRouter();
	const { session } = useAuth();
	const orgId = session?.activeOrganizationId ?? "";

	const { data: deptRes, isPending: deptLoading } = useOrgDepartments({
		page: 1,
		limit: 200,
	});
	const departments = deptRes?.data?.docs ?? [];

	const updateMut = useUpdateTemplate();

	const [form, setForm] = useState(() => ({
		name: template.name,
		role: template.role,
		departmentId: normalizeDepartmentId(template.departmentId),
		description: template.description ?? "",
	}));

	const [items, setItems] = useState(() =>
		kpiTemplateItemsToDrafts(template.items ?? []),
	);

	const updateItem = (localId: string, next: DraftTemplateItem) => {
		setItems((prev) => prev.map((it) => (it.localId === localId ? next : it)));
	};

	const removeItem = (localId: string) => {
		setItems((prev) => prev.filter((it) => it.localId !== localId));
	};

	const addItem = () => {
		setItems((prev) => [...prev, createEmptyDraftItem("percent")]);
	};

	const departmentSelectOptions = useMemo((): Department[] => {
		const id = form.departmentId;
		if (!id) return departments;
		const has = departments.some((d) => d._id === id);
		if (has) return departments;
		return [
			...departments,
			{
				_id: id,
				name: labelForMissingDepartmentOption(template, id),
				slug: "—",
			},
		];
	}, [departments, form.departmentId, template]);

	const deptSelect = useMemo(
		() => (
			<div className="grid gap-2">
				<Label>Department</Label>
				<Select
					value={form.departmentId ? form.departmentId : undefined}
					onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
					<SelectTrigger>
						<SelectValue placeholder="Select department" />
					</SelectTrigger>
					<SelectContent>
						{departmentSelectOptions.map((d) => (
							<SelectItem key={d._id} value={d._id}>
								{d.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		),
		[form.departmentId, departmentSelectOptions],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgId) {
			toast.error("No active organization");
			return;
		}
		if (!form.name.trim() || !form.role.trim() || !form.departmentId) {
			toast.error("Name, role, and department are required");
			return;
		}
		const built = draftsToKpiTemplateItems(items);
		if (!built.ok) {
			toast.error(built.message);
			return;
		}
		try {
			await updateMut.mutateAsync({
				id: template._id,
				body: {
					name: form.name.trim(),
					role: form.role.trim(),
					departmentId: form.departmentId || null,
					description: form.description.trim() || undefined,
					items: built.items,
				},
			});
			toast.success("Template updated");
			router.push("/templates");
			router.refresh();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	};

	const busy = updateMut.isPending;

	return (
		<form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
			<Alert className="p-4">
				<AlertTitle>Before you save</AlertTitle>
				<AlertDescription className="text-muted-foreground space-y-2 text-sm leading-relaxed">
					<p>
						At least one employee in the chosen department must have a{" "}
						<code className="rounded bg-muted px-1 text-xs">
							departmentRole
						</code>{" "}
						that matches this template&apos;s role (case-insensitive), or the
						server may return{" "}
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
				<div className="grid gap-3">
					<div className="grid gap-2">
						<Label htmlFor="tpl-edit-name">Name</Label>
						<Input
							id="tpl-edit-name"
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="tpl-edit-role">
							Role (matches employee department role)
						</Label>
						<Input
							id="tpl-edit-role"
							value={form.role}
							onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
						/>
					</div>
					{deptLoading ? <Skeleton className="h-10 w-full" /> : deptSelect}
					<div className="grid gap-2">
						<Label htmlFor="tpl-edit-desc">Description (optional)</Label>
						<Textarea
							id="tpl-edit-desc"
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
							rows={2}
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
				<Button type="submit" disabled={busy}>
					{busy ? "Saving…" : "Save changes"}
				</Button>
				<Button type="button" variant="outline" asChild disabled={busy}>
					<Link href="/templates">Cancel</Link>
				</Button>
			</div>
		</form>
	);
}

export function TemplateEditForm({ templateId }: TemplateEditFormProps) {
	const { data, isPending, isError, error, refetch } = useTemplate(templateId);
	const template = data?.data?.template;

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-md" />
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (isError || !template) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load template</AlertTitle>
				<AlertDescription className="flex flex-col gap-2">
					<span>{error instanceof Error ? error.message : "Request failed"}</span>
					<div className="flex flex-wrap gap-2">
						<Button type="button" variant="outline" size="sm" asChild>
							<Link href="/templates">Back to templates</Link>
						</Button>
						<button
							type="button"
							className="text-sm underline"
							onClick={() => void refetch()}>
							Retry
						</button>
					</div>
				</AlertDescription>
			</Alert>
		);
	}

	return <TemplateEditFormBody key={template._id} template={template} />;
}
