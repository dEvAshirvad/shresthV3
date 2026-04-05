import type { ListOrganizationMembersQuery } from "@/queries/auth";

/** Default list behavior aligned with the list-members API (sort + page size). */
export const DEFAULT_MEMBERS_LIST_PARAMS: Pick<
	ListOrganizationMembersQuery,
	"limit" | "offset" | "sortBy" | "sortDirection"
> = {
	limit: 100,
	offset: 0,
	sortBy: "createdAt",
	sortDirection: "desc",
};

/**
 * Members table is for management roles only — staff are excluded from this list.
 * "all" loads owner, admin, and nodal via `filterOperator=in` and repeated `filterValue`.
 */
export const ROLE_FILTER_OPTIONS = [
	{ value: "all", label: "Owner, Admin & Nodal" },
	{ value: "owner", label: "Owner" },
	{ value: "admin", label: "Admin" },
	{ value: "nodal", label: "Nodal" },
] as const;

export type RoleFilterValue = (typeof ROLE_FILTER_OPTIONS)[number]["value"];

const MANAGEMENT_ROLES = ["owner", "admin", "nodal"] as const;

export function membersQueryForFilter(
	filter: RoleFilterValue,
): ListOrganizationMembersQuery {
	const base: ListOrganizationMembersQuery = {
		...DEFAULT_MEMBERS_LIST_PARAMS,
		filterField: "role",
	};

	if (filter === "all") {
		return {
			...base,
			filterOperator: "in",
			filterValue: [...MANAGEMENT_ROLES],
		};
	}

	return {
		...base,
		filterOperator: "eq",
		filterValue: filter,
	};
}
