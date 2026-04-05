import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/departments";

// ──────────────────────────────────────────────
// Types (zKpiItem / zKpiTemplateCreate)
// ──────────────────────────────────────────────

export type KpiItemInputType = "number" | "percent" | "boolean";

/** Discriminated on `type` (not `kind`). Pairing: percent↔percent, target↔number, boolean↔boolean, range↔number */
export type KpiItemJudgement =
	| { type: "percent"; mode?: "linear" }
	| {
			type: "target";
			mode?: "best_match" | "nearest";
			slabs: Array<{ target: number; marks: number }>;
	  }
	/** `true` → full `maxMarks`; `false` → `0`. No `trueMarks` field. */
	| { type: "boolean" }
	/** First matching band in array order wins. Older API rows may use a single `min`/`max`/`marks` on the judgement instead of `ranges`. */
	| { type: "range"; ranges: Array<{ min: number; max: number; marks: number }> };

export type KpiTemplateItem = {
	_id?: string;
	title: string;
	description?: string | null;
	inputType: KpiItemInputType;
	/** Display only for `number` inputs (target/range). Omit for `percent` (forbidden if non-empty). */
	unit?: string | null;
	maxMarks: number;
	judgement: KpiItemJudgement;
	isActive?: boolean;
};

export type KpiTemplate = {
	_id: string;
	organizationId: string;
	departmentId?: string | null;
	role: string;
	name: string;
	description?: string | null;
	items: KpiTemplateItem[];
	createdAt?: string;
	updatedAt?: string;
};

export type ListTemplatesQuery = {
	page?: number;
	limit?: number;
	search?: string;
	departmentId?: string;
	role?: string;
};

export type ListTemplatesData = {
	docs: KpiTemplate[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
};

export type ListTemplatesResponse = ApiSuccessEnvelope<ListTemplatesData>;

export type TemplateSingleData = {
	template: KpiTemplate;
	message: string;
};

export type TemplateSingleResponse = ApiSuccessEnvelope<TemplateSingleData>;

/** Server overwrites `organizationId` from session; must be present in JSON. */
export type KpiTemplateCreateBody = {
	organizationId: string;
	departmentId?: string | null;
	role: string;
	name: string;
	description?: string;
	items: KpiTemplateItem[];
};

export type KpiTemplateUpdateBody = Partial<KpiTemplateCreateBody>;

const BASE = "/api/v1/templates";

export const templateKeys = {
	all: ["templates"] as const,
	list: (params: ListTemplatesQuery) =>
		[...templateKeys.all, "list", params] as const,
	detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

export async function listTemplates(
	params: ListTemplatesQuery = {},
): Promise<ListTemplatesResponse> {
	const { data } = await api.get<ListTemplatesResponse>(BASE, { params });
	return data;
}

export async function getTemplate(id: string): Promise<TemplateSingleResponse> {
	const { data } = await api.get<TemplateSingleResponse>(`${BASE}/${id}`);
	return data;
}

export async function createTemplate(
	body: KpiTemplateCreateBody,
): Promise<TemplateSingleResponse> {
	const { data } = await api.post<TemplateSingleResponse>(BASE, body);
	return data;
}

export async function updateTemplate(
	id: string,
	body: KpiTemplateUpdateBody,
): Promise<TemplateSingleResponse> {
	const { data } = await api.put<TemplateSingleResponse>(
		`${BASE}/${id}`,
		body,
	);
	return data;
}

export async function deleteTemplate(id: string): Promise<TemplateSingleResponse> {
	const { data } = await api.delete<TemplateSingleResponse>(`${BASE}/${id}`);
	return data;
}

export function useListTemplates(params: ListTemplatesQuery = {}) {
	return useQuery({
		queryKey: templateKeys.list(params),
		queryFn: () => listTemplates(params),
	});
}

export function useTemplate(id: string) {
	return useQuery({
		queryKey: templateKeys.detail(id),
		queryFn: () => getTemplate(id),
		enabled: !!id,
	});
}

export function useCreateTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createTemplate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templateKeys.all });
		},
	});
}

export function useUpdateTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: KpiTemplateUpdateBody }) =>
			updateTemplate(id, body),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: templateKeys.all });
			queryClient.invalidateQueries({
				queryKey: templateKeys.detail(variables.id),
			});
		},
	});
}

export function useDeleteTemplate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteTemplate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templateKeys.all });
		},
	});
}
