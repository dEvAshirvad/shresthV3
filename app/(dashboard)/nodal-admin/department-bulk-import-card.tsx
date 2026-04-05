"use client";

import Link from "next/link";

import { DepartmentImportDropdown } from "../department/department-import-dropdown";

/**
 * Surfaces the same department CSV/XLSX import as the Departments page so nodal
 * admins can run it without leaving this screen.
 */
export function DepartmentBulkImportCard() {
	return (
		<section className="bg-muted/30 border border-dashed p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Department bulk import
					</h2>
					<p className="text-muted-foreground mt-1 max-w-2xl text-sm">
						Download a template with <code className="text-xs">name</code>,{" "}
						<code className="text-xs">slug</code>, and optional{" "}
						<code className="text-xs">nodal_email</code> (member login email).
						Rows upsert by slug; unresolved nodal emails are reported after
						import.{" "}
						<Link
							href="/department"
							className="text-primary underline underline-offset-2">
							Open departments
						</Link>
						. Admins can also open the{" "}
						<Link href="/admin" className="text-primary underline underline-offset-2">
							Admin
						</Link>{" "}
						for the full table.
					</p>
				</div>
				<div className="shrink-0">
					<DepartmentImportDropdown />
				</div>
			</div>
		</section>
	);
}
