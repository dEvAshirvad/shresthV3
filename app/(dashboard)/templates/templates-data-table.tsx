"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgDepartments } from "@/hooks/use-org-departments";
import { useListTemplates } from "@/queries/templates";
import type { ListTemplatesQuery } from "@/queries/templates";

import { getTemplateColumns } from "./columns";
import { mapTemplateToRow } from "./map-template-row";
import { TemplatesToolbar } from "./templates-toolbar";

export function TemplatesDataTable() {
	const [departmentFilter, setDepartmentFilter] = useState("");
	const [roleInput, setRoleInput] = useState("");
	const [roleDebounced, setRoleDebounced] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setRoleDebounced(roleInput.trim()), 400);
		return () => clearTimeout(t);
	}, [roleInput]);

	const listParams = useMemo((): ListTemplatesQuery => {
		return {
			page: 1,
			limit: 100,
			departmentId: departmentFilter || undefined,
			role: roleDebounced || undefined,
		};
	}, [departmentFilter, roleDebounced]);

	const { data: deptRes } = useOrgDepartments({ page: 1, limit: 200 });
	const departments = deptRes?.data?.docs ?? [];

	const deptNameById = useMemo(() => {
		const m = new Map<string, string>();
		for (const d of departments) {
			m.set(d._id, d.name);
		}
		return m;
	}, [departments]);

	const { data, isPending, isError, error, refetch } =
		useListTemplates(listParams);

	const rows = useMemo(() => {
		const docs = data?.data?.docs;
		if (!docs?.length) return [];
		return docs.map((t) => mapTemplateToRow(t, deptNameById));
	}, [data, deptNameById]);

	const columns = useMemo(() => getTemplateColumns(), []);

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full max-w-sm" />
				<Skeleton className="h-64 w-full rounded-md" />
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Could not load templates</AlertTitle>
				<AlertDescription className="flex flex-col gap-2">
					<span>{error instanceof Error ? error.message : "Request failed"}</span>
					<button
						type="button"
						className="text-sm underline"
						onClick={() => void refetch()}>
						Retry
					</button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={rows}
			getRowId={(row) => row._id}
			defaultPageSize={10}
			emptyMessage="No templates yet. Create one with full line items on the New template page."
			renderToolbar={(table) => (
				<TemplatesToolbar
					table={table}
					departments={departments}
					departmentFilter={departmentFilter}
					onDepartmentFilterChange={setDepartmentFilter}
					roleFilter={roleInput}
					onRoleFilterChange={setRoleInput}
				/>
			)}
		/>
	);
}
