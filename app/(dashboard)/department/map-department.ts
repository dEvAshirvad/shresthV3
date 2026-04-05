import type { Department } from "@/queries/departments";

import type { DepartmentTableRow } from "./columns";

function assignedNodalLabel(
	assigned: Department["assignedNodal"],
): string | null {
	if (assigned == null) return null;
	if (typeof assigned === "string") return assigned;
	if (typeof assigned === "object") {
		const o = assigned as {
			userId?: { name?: string; email?: string } | string;
		};
		if (o.userId && typeof o.userId === "object") {
			return o.userId.name ?? o.userId.email ?? null;
		}
		if (typeof o.userId === "string") return o.userId;
	}
	return null;
}

export function mapDepartmentToRow(dept: Department): DepartmentTableRow {
	const updated = dept.updatedAt ?? dept.createdAt ?? "";
	return {
		id: dept._id,
		name: dept.name,
		slug: dept.slug,
		assignedNodal: assignedNodalLabel(dept.assignedNodal),
		updatedAt: updated
			? new Date(updated).toLocaleDateString(undefined, {
					year: "numeric",
					month: "short",
					day: "numeric",
				})
			: "—",
	};
}
