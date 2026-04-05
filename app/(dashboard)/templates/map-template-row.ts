import type { KpiTemplate } from "@/queries/templates";

export type TemplateTableRow = KpiTemplate & {
	departmentLabel: string;
};

export function mapTemplateToRow(
	t: KpiTemplate,
	deptNameById: Map<string, string>,
): TemplateTableRow {
	const id = t.departmentId ?? undefined;
	const departmentLabel = id ? (deptNameById.get(id) ?? id) : "—";
	return { ...t, departmentLabel };
}
