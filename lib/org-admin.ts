/** Session org roles that may call org-scoped `/admin/*` KPI routes. */
export function isOrgAdminRole(role: string | null | undefined): boolean {
	if (!role) return false;
	const r = role.toLowerCase();
	return r === "owner" || r === "admin" || r === "nodal";
}

/** Owner or org admin — `/api/v1/organization/invitations` list/import (`invitations.api.md`). */
export function isOrgOwnerOrAdmin(role: string | null | undefined): boolean {
	if (!role) return false;
	const r = role.toLowerCase();
	return r === "owner" || r === "admin";
}
