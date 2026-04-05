import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type Session = {
	id: string;
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string;
	userAgent: string;
	userId: string;
	impersonatedBy: string | null;
	activeOrganizationId: string | null;
	/** Org role for the active org when present (`owner` | `admin` | `nodal` | …). */
	activeOrganizationRole?: string | null;
};

export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: string;
	updatedAt: string;
	role: string;
	banned: boolean;
	banReason: string | null;
	banExpires: string | null;
	isOnboarded: boolean;
};

export type GetSessionResponse = {
	session: Session | null;
	user: User | null;
};

export type SocialSignInBody = {
	callbackURL: string;
	newUserCallbackURL: string;
	provider: "google";
};

export type SocialSignInResponse = {
	url: string;
	redirect: boolean;
};

export type SignOutResponse = {
	success: boolean;
};

export type SignUpEmailBody = {
	name: string;
	email: string;
	password: string;
	image?: string;
	callbackURL?: string;
	rememberMe?: boolean;
};

export type SignUpEmailResponse = {
	token: string | null;
	user: User;
};

export type SignInEmailBody = {
	email: string;
	password: string;
	callbackURL?: string | null;
	rememberMe?: boolean | null;
};

export type SignInEmailResponse = {
	redirect: boolean;
	token: string;
	url?: string | null;
	user: User;
};

export type ResetPasswordBody = {
	newPassword: string;
	token?: string | null;
};

export type ResetPasswordResponse = {
	status: boolean;
};

export type VerifyPasswordBody = {
	password: string;
};

export type VerifyPasswordResponse = {
	status: boolean;
};

export type VerifyEmailResponse = {
	user: User;
	status: boolean;
};

export type SendVerificationEmailBody = {
	email: string;
	callbackURL?: string | null;
};

export type SendVerificationEmailResponse = {
	status: boolean;
};

export type ChangeEmailBody = {
	newEmail: string;
	callbackURL?: string | null;
};

export type ChangeEmailResponse = {
	user?: User;
	status: boolean;
	message?: "Email updated" | "Verification email sent" | null;
};

export type ChangePasswordBody = {
	newPassword: string;
	currentPassword: string;
	revokeOtherSessions?: boolean | null;
};

export type ChangePasswordResponse = {
	token: string | null;
	user: User;
};

export type UpdateUserBody = {
	name?: string;
	image?: string | null;
};

export type UpdateUserResponse = {
	user: User;
};

export type DeleteUserBody = {
	callbackURL?: string;
	password?: string;
	token?: string;
};

export type DeleteUserResponse = {
	success: boolean;
	message: "User deleted" | "Verification email sent";
};

export type RequestPasswordResetBody = {
	email: string;
	redirectTo?: string | null;
};

export type RequestPasswordResetResponse = {
	status: boolean;
	message?: string;
};

export type RevokeSessionBody = {
	token: string;
};

export type RevokeSessionResponse = {
	status: boolean;
};

export type RevokeSessionsResponse = {
	status: boolean;
};

export type RevokeOtherSessionsResponse = {
	status: boolean;
};

export type LinkSocialBody = {
	callbackURL?: string | null;
	provider: string;
	disableRedirect?: boolean | null;
	errorCallbackURL?: string | null;
};

export type LinkSocialResponse = {
	url?: string;
	redirect: boolean;
	status?: boolean;
};

export type LinkedAccount = {
	id: string;
	providerId: string;
	createdAt: string;
	updatedAt: string;
	accountId: string;
	userId: string;
	scopes: string[];
};

export type UnlinkAccountBody = {
	providerId: string;
	accountId?: string | null;
};

export type UnlinkAccountResponse = {
	status: boolean;
};

export type RefreshTokenBody = {
	providerId: string;
	accountId?: string | null;
	userId?: string | null;
};

export type RefreshTokenResponse = {
	tokenType?: string;
	idToken?: string;
	accessToken?: string;
	refreshToken?: string;
	accessTokenExpiresAt?: string;
	refreshTokenExpiresAt?: string;
};

export type GetAccessTokenBody = {
	providerId: string;
	accountId?: string | null;
	userId?: string | null;
};

export type GetAccessTokenResponse = {
	tokenType?: string;
	idToken?: string;
	accessToken?: string;
	accessTokenExpiresAt?: string;
};

export type AccountInfoResponse = {
	user: {
		id: string;
		name?: string;
		email?: string;
		image?: string;
		emailVerified: boolean;
	};
	data: Record<string, unknown>;
};

export type OkResponse = {
	ok: boolean;
};

// ──────────────────────────────────────────────
// Organization, Onboarding & Admin types
// ──────────────────────────────────────────────

// Finager organization helpers (app-level, not Better Auth core)

export type GenerateOrgCodeBody = {
	name?: string;
	slug?: string;
};

export type GenerateOrgCodeResponse = {
	success: boolean;
	status: number;
	data: string;
	timestamp: string;
	requestId?: string;
};

export type SetActiveOrganizationOnSessionBody = {
	organizationId: string;
};

export type SetActiveOrganizationOnSessionResponse = {
	success: boolean;
	status: number;
	data: GetSessionResponse | Record<string, unknown>;
	timestamp: string;
	requestId?: string;
};

// Onboarding (app-level) types

export type CompleteOnboardingResponse = {
	success: boolean;
	status: number;
	data: {
		message: string;
	};
	timestamp: string;
	requestId?: string;
};

export type Organization = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	createdAt: string;
	metadata?: string | null;
	orgCode: string;
};

export type OrganizationMember = {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: string;
};

/** Member row from `GET /api/auth/organization/list-members` (includes populated `user`). */
export type OrganizationMemberListItem = OrganizationMember & {
	user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
};

export type ListOrganizationMembersQuery = {
	/** When omitted, the API uses the user’s active organization. */
	organizationId?: string;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	filterField?: string;
	filterOperator?: string;
	filterValue?: string | number | boolean | string[] | number[];
};

export type ListOrganizationMembersResponse = {
	members: OrganizationMemberListItem[];
	total: number;
};

export type OrganizationInvitation = {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: string;
	expiresAt: string;
};

export type CreateOrganizationBody = {
	name: string;
	slug: string;
	logo?: string | null;
	metadata?: string | null;
	keepCurrentActiveOrganization?: boolean | null;
	orgCode?: string;
};

export type CreateOrganizationResponse = Organization;

export type UpdateOrganizationBody = {
	organizationId?: string | null;
	name?: string | null;
	slug?: string | null;
	logo?: string | null;
	metadata?: string | null;
};

export type UpdateOrganizationResponse = Organization;

export type DeleteOrganizationBody = {
	organizationId: string;
};

export type DeleteOrganizationResponse = string;

export type SetActiveOrganizationBody = {
	organizationId?: string | null;
	organizationSlug?: string | null;
};

export type SetActiveOrganizationResponse = Organization;

export type GetOrganizationResponse = Organization;

export type ListOrganizationsResponse = Organization[];

export type InviteOrganizationMemberBody = {
	email: string;
	role: string;
	organizationId?: string | null;
	resend?: boolean | null;
};

export type InviteOrganizationMemberResponse = OrganizationInvitation;

export type CancelOrganizationInvitationBody = {
	invitationId: string;
};

export type CancelOrganizationInvitationResponse = {
	status: boolean;
};

export type AcceptOrganizationInvitationBody = {
	invitationId: string;
};

/** `POST /api/auth/organization/accept-invitation` — shape may include legacy `organization` or `member` + `invitation`. */
export type AcceptOrganizationInvitationResponse = {
	status?: boolean;
	organization?: Organization;
	invitation?: OrganizationInvitation;
	member?: OrganizationMember;
};

export type GetOrganizationInvitationResponse = OrganizationInvitation & {
	organizationName: string;
	organizationSlug: string;
	inviterEmail: string;
};

export type RejectOrganizationInvitationBody = {
	invitationId: string;
};

export type RejectOrganizationInvitationResponse = {
	status: boolean;
};

export type ListOrganizationInvitationsResponse = OrganizationInvitation[];

/** Invitations received by the current user (`GET .../list-user-invitations`). */
export type UserOrganizationInvitation = {
	id: string;
	email: string;
	role: string;
	organizationId: string;
	organizationName: string;
	inviterId: string;
	teamId?: string | null;
	status: string;
	expiresAt: string;
	createdAt: string;
};

export type ListUserOrganizationInvitationsResponse =
	UserOrganizationInvitation[];

export type GetActiveOrganizationMemberResponse = OrganizationMember;

export type CheckOrganizationSlugBody = {
	slug: string;
};

export type CheckOrganizationSlugResponse =
	| {
			available: true;
	  }
	| {
			available: false;
			message: string;
	  };

export type RemoveOrganizationMemberBody = {
	identifier: string;
	organizationId?: string | null;
};

export type RemoveOrganizationMemberResponse = {
	status: boolean;
};

// Admin-related helper types reusing existing `User` and `Session`

export type AdminListUsersQuery = {
	search?: string;
	skip?: number;
	limit?: number;
};

export type AdminListUsersResponse = {
	users: User[];
	total: number;
};

export type AdminGetUserQuery = {
	id?: string;
	email?: string;
};

export type AdminSetUserRoleBody = {
	userId: string;
	role: string;
};

export type AdminBanUserBody = {
	userId: string;
	banReason?: string | null;
	banExpires?: string | null;
};

export type AdminUnbanUserBody = {
	userId: string;
};

export type AdminImpersonateUserBody = {
	userId: string;
};

export type AdminRevokeUserSessionBody = {
	sessionId: string;
};

export type AdminRevokeUserSessionsBody = {
	userId: string;
};

export type AdminRemoveUserBody = {
	userId: string;
};

export type AdminSetUserPasswordBody = {
	userId: string;
	newPassword: string;
};

export type AdminListUserSessionsBody = {
	userId: string;
};

export type AdminListUserSessionsResponse = Session[];

export type AdminHasPermissionBody = {
	userId: string;
	permission: string;
};

export type AdminHasPermissionResponse = {
	hasPermission: boolean;
};

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const authKeys = {
	all: ["auth"] as const,
	getSession: () => [...authKeys.all, "session"] as const,
	listSessions: () => [...authKeys.all, "sessions"] as const,
	listAccounts: () => [...authKeys.all, "accounts"] as const,
	accountInfo: () => [...authKeys.all, "account-info"] as const,
};

export const organizationKeys = {
	all: ["organization"] as const,
	list: () => [...organizationKeys.all, "list"] as const,
	active: () => [...organizationKeys.all, "active"] as const,
	members: (params: ListOrganizationMembersQuery) =>
		[...organizationKeys.all, "members", params] as const,
	invitations: () => [...organizationKeys.all, "invitations"] as const,
	invitation: (id: string) =>
		[...organizationKeys.all, "invitation", id] as const,
	userInvitations: () =>
		[...organizationKeys.all, "user-invitations"] as const,
	activeMember: () => [...organizationKeys.all, "active-member"] as const,
	checkSlug: (slug: string) =>
		[...organizationKeys.all, "check-slug", slug] as const,
};

export const adminKeys = {
	all: ["admin"] as const,
	users: () => [...adminKeys.all, "users"] as const,
	user: (idOrEmail: string) => [...adminKeys.all, "user", idOrEmail] as const,
	userSessions: (userId: string) =>
		[...adminKeys.all, "user-sessions", userId] as const,
};

// ──────────────────────────────────────────────
// API functions
// ──────────────────────────────────────────────

async function getSession(): Promise<GetSessionResponse> {
	const { data } = await api.get<GetSessionResponse>("/api/auth/get-session");
	return data;
}

async function signInSocial(
	body: SocialSignInBody,
): Promise<SocialSignInResponse> {
	const { data } = await api.post<SocialSignInResponse>(
		"/api/auth/sign-in/social",
		{
			callbackURL: process.env.NEXT_PUBLIC_FRONTEND + body.callbackURL,
			newUserCallbackURL:
				process.env.NEXT_PUBLIC_FRONTEND + body.newUserCallbackURL,
			provider: body.provider,
		},
	);
	return data;
}

async function signOut(): Promise<SignOutResponse> {
	const { data } = await api.post<SignOutResponse>("/api/auth/sign-out", {});
	return data;
}

async function signUpEmail(
	body: SignUpEmailBody,
): Promise<SignUpEmailResponse> {
	const { data } = await api.post<SignUpEmailResponse>(
		"/api/auth/sign-up/email",
		body,
	);
	return data;
}

async function signInEmail(
	body: SignInEmailBody,
): Promise<SignInEmailResponse> {
	const { data } = await api.post<SignInEmailResponse>(
		"/api/auth/sign-in/email",
		body,
	);
	return data;
}

async function resetPassword(
	body: ResetPasswordBody,
): Promise<ResetPasswordResponse> {
	const { data } = await api.post<ResetPasswordResponse>(
		"/api/auth/reset-password",
		body,
	);
	return data;
}

async function verifyPassword(
	body: VerifyPasswordBody,
): Promise<VerifyPasswordResponse> {
	const { data } = await api.post<VerifyPasswordResponse>(
		"/api/auth/verify-password",
		body,
	);
	return data;
}

async function verifyEmail(
	token: string,
	callbackURL?: string,
): Promise<VerifyEmailResponse> {
	const { data } = await api.get<VerifyEmailResponse>(
		"/api/auth/verify-email",
		{ params: { token, callbackURL } },
	);
	return data;
}

async function sendVerificationEmail(
	body: SendVerificationEmailBody,
): Promise<SendVerificationEmailResponse> {
	const { data } = await api.post<SendVerificationEmailResponse>(
		"/api/auth/send-verification-email",
		body,
	);
	return data;
}

async function changeEmail(
	body: ChangeEmailBody,
): Promise<ChangeEmailResponse> {
	const { data } = await api.post<ChangeEmailResponse>(
		"/api/auth/change-email",
		body,
	);
	return data;
}

async function changePassword(
	body: ChangePasswordBody,
): Promise<ChangePasswordResponse> {
	const { data } = await api.post<ChangePasswordResponse>(
		"/api/auth/change-password",
		body,
	);
	return data;
}

async function updateUser(body: UpdateUserBody): Promise<UpdateUserResponse> {
	const { data } = await api.post<UpdateUserResponse>(
		"/api/auth/update-user",
		body,
	);
	return data;
}

async function deleteUser(body: DeleteUserBody): Promise<DeleteUserResponse> {
	const { data } = await api.post<DeleteUserResponse>(
		"/api/auth/delete-user",
		body,
	);
	return data;
}

async function requestPasswordReset(
	body: RequestPasswordResetBody,
): Promise<RequestPasswordResetResponse> {
	const { data } = await api.post<RequestPasswordResetResponse>(
		"/api/auth/request-password-reset",
		body,
	);
	return data;
}

async function listSessions(): Promise<Session[]> {
	const { data } = await api.get<Session[]>("/api/auth/list-sessions");
	return data;
}

async function revokeSession(
	body: RevokeSessionBody,
): Promise<RevokeSessionResponse> {
	const { data } = await api.post<RevokeSessionResponse>(
		"/api/auth/revoke-session",
		body,
	);
	return data;
}

async function revokeSessions(): Promise<RevokeSessionsResponse> {
	const { data } = await api.post<RevokeSessionsResponse>(
		"/api/auth/revoke-sessions",
		{},
	);
	return data;
}

async function revokeOtherSessions(): Promise<RevokeOtherSessionsResponse> {
	const { data } = await api.post<RevokeOtherSessionsResponse>(
		"/api/auth/revoke-other-sessions",
		{},
	);
	return data;
}

async function linkSocial(body: LinkSocialBody): Promise<LinkSocialResponse> {
	const { data } = await api.post<LinkSocialResponse>(
		"/api/auth/link-social",
		body,
	);
	return data;
}

async function listAccounts(): Promise<LinkedAccount[]> {
	const { data } = await api.get<LinkedAccount[]>("/api/auth/list-accounts");
	return data;
}

async function unlinkAccount(
	body: UnlinkAccountBody,
): Promise<UnlinkAccountResponse> {
	const { data } = await api.post<UnlinkAccountResponse>(
		"/api/auth/unlink-account",
		body,
	);
	return data;
}

async function refreshToken(
	body: RefreshTokenBody,
): Promise<RefreshTokenResponse> {
	const { data } = await api.post<RefreshTokenResponse>(
		"/api/auth/refresh-token",
		body,
	);
	return data;
}

async function getAccessToken(
	body: GetAccessTokenBody,
): Promise<GetAccessTokenResponse> {
	const { data } = await api.post<GetAccessTokenResponse>(
		"/api/auth/get-access-token",
		body,
	);
	return data;
}

async function getAccountInfo(): Promise<AccountInfoResponse> {
	const { data } = await api.get<AccountInfoResponse>("/api/auth/account-info");
	return data;
}

async function checkOk(): Promise<OkResponse> {
	const { data } = await api.get<OkResponse>("/api/auth/ok");
	return data;
}

// ──────────────────────────────────────────────
// Finager organization helpers (app-level)
// ──────────────────────────────────────────────

async function generateOrgCode(
	body: GenerateOrgCodeBody,
): Promise<GenerateOrgCodeResponse> {
	const { data } = await api.post<GenerateOrgCodeResponse>(
		"/api/v1/organization/generate-org-code",
		body,
	);
	return data;
}

async function setActiveOrganizationOnSession(
	body: SetActiveOrganizationOnSessionBody,
): Promise<SetActiveOrganizationOnSessionResponse> {
	const { data } = await api.post<SetActiveOrganizationOnSessionResponse>(
		"/api/v1/organization/set-active-organization",
		body,
	);
	return data;
}

// ──────────────────────────────────────────────
// Onboarding API functions (app-level)
// ──────────────────────────────────────────────

async function completeOnboarding(): Promise<CompleteOnboardingResponse> {
	const { data } = await api.post<CompleteOnboardingResponse>(
		"/api/v1/onboarding/complete-onboarding",
		{},
	);
	return data;
}

// ──────────────────────────────────────────────
// Organization API functions
// ──────────────────────────────────────────────

async function createOrganization(
	body: CreateOrganizationBody,
): Promise<CreateOrganizationResponse> {
	const { data } = await api.post<CreateOrganizationResponse>(
		"/api/auth/organization/create",
		body,
	);
	return data;
}

async function updateOrganization(
	body: UpdateOrganizationBody,
): Promise<UpdateOrganizationResponse> {
	const { data } = await api.post<UpdateOrganizationResponse>(
		"/api/auth/organization/update",
		body,
	);
	return data;
}

async function deleteOrganization(
	body: DeleteOrganizationBody,
): Promise<DeleteOrganizationResponse> {
	const { data } = await api.post<DeleteOrganizationResponse>(
		"/api/auth/organization/delete",
		body,
	);
	return data;
}

async function setActiveOrganization(
	body: SetActiveOrganizationBody,
): Promise<SetActiveOrganizationResponse> {
	const { data } = await api.post<SetActiveOrganizationResponse>(
		"/api/auth/organization/set-active",
		body,
	);
	return data;
}

async function getOrganization(): Promise<GetOrganizationResponse> {
	const { data } = await api.get<GetOrganizationResponse>(
		"/api/auth/organization/get-full-organization",
	);
	return data;
}

async function listOrganizations(): Promise<ListOrganizationsResponse> {
	const { data } = await api.get<ListOrganizationsResponse>(
		"/api/auth/organization/list",
	);
	return data;
}

/**
 * Builds query string so `filterValue` repeats per value (e.g. `in` with owner, admin, nodal),
 * matching `filterValue=a&filterValue=b` style expected by the API.
 */
function buildListOrganizationMembersSearchParams(
	params: ListOrganizationMembersQuery,
): string {
	const sp = new URLSearchParams();
	for (const [key, raw] of Object.entries(params)) {
		if (raw === undefined || raw === null) continue;
		if (key === "filterValue" && Array.isArray(raw)) {
			for (const v of raw) {
				sp.append("filterValue", String(v));
			}
			continue;
		}
		sp.append(key, String(raw));
	}
	return sp.toString();
}

export async function listOrganizationMembers(
	params: ListOrganizationMembersQuery = {},
): Promise<ListOrganizationMembersResponse> {
	const qs = buildListOrganizationMembersSearchParams(params);
	const path =
		qs.length > 0
			? `/api/auth/organization/list-members?${qs}`
			: "/api/auth/organization/list-members";
	const { data } = await api.get<ListOrganizationMembersResponse>(path);
	return data;
}

async function inviteOrganizationMember(
	body: InviteOrganizationMemberBody,
): Promise<InviteOrganizationMemberResponse> {
	const { data } = await api.post<InviteOrganizationMemberResponse>(
		"/api/auth/organization/invite-member",
		body,
	);
	return data;
}

async function cancelOrganizationInvitation(
	body: CancelOrganizationInvitationBody,
): Promise<CancelOrganizationInvitationResponse> {
	const { data } = await api.post<CancelOrganizationInvitationResponse>(
		"/api/auth/organization/cancel-invitation",
		body,
	);
	return data;
}

async function acceptOrganizationInvitation(
	body: AcceptOrganizationInvitationBody,
): Promise<AcceptOrganizationInvitationResponse> {
	const { data } = await api.post<AcceptOrganizationInvitationResponse>(
		"/api/auth/organization/accept-invitation",
		body,
	);
	return data;
}

async function getOrganizationInvitation(
	invitationId: string,
): Promise<GetOrganizationInvitationResponse> {
	const { data } = await api.get<GetOrganizationInvitationResponse>(
		"/api/auth/organization/get-invitation",
		{
			params: { invitationId },
		},
	);
	return data;
}

async function rejectOrganizationInvitation(
	body: RejectOrganizationInvitationBody,
): Promise<RejectOrganizationInvitationResponse> {
	const { data } = await api.post<RejectOrganizationInvitationResponse>(
		"/api/auth/organization/reject-invitation",
		body,
	);
	return data;
}

export async function listOrganizationInvitations(): Promise<ListOrganizationInvitationsResponse> {
	const { data } = await api.get<ListOrganizationInvitationsResponse>(
		"/api/auth/organization/list-invitations",
	);
	return data;
}

async function listUserOrganizationInvitations(): Promise<ListUserOrganizationInvitationsResponse> {
	const { data } = await api.get<ListUserOrganizationInvitationsResponse>(
		"/api/auth/organization/list-user-invitations",
	);
	return data;
}

async function getActiveOrganizationMember(): Promise<GetActiveOrganizationMemberResponse> {
	const { data } = await api.get<GetActiveOrganizationMemberResponse>(
		"/api/auth/organization/get-active-member",
	);
	return data;
}

async function checkOrganizationSlug(
	body: CheckOrganizationSlugBody,
): Promise<CheckOrganizationSlugResponse> {
	const { data } = await api.post<CheckOrganizationSlugResponse>(
		"/api/auth/organization/check-slug",
		body,
	);
	return data;
}

async function removeOrganizationMember(
	body: RemoveOrganizationMemberBody,
): Promise<RemoveOrganizationMemberResponse> {
	const { data } = await api.post<RemoveOrganizationMemberResponse>(
		"/api/auth/organization/remove-member",
		body,
	);
	return data;
}

// ──────────────────────────────────────────────
// Admin API functions
// ──────────────────────────────────────────────

async function adminListUsers(
	params: AdminListUsersQuery = {},
): Promise<AdminListUsersResponse> {
	const { data } = await api.get<AdminListUsersResponse>("/api/auth/admin/list-users", {
		params,
	});
	return data;
}

async function adminGetUser(
	params: AdminGetUserQuery,
): Promise<User> {
	const { data } = await api.get<User>("/api/auth/admin/get-user", {
		params,
	});
	return data;
}

async function adminSetUserRole(
	body: AdminSetUserRoleBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>("/api/auth/admin/set-role", body);
	return data;
}

async function adminBanUser(
	body: AdminBanUserBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>("/api/auth/admin/ban-user", body);
	return data;
}

async function adminUnbanUser(
	body: AdminUnbanUserBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>("/api/auth/admin/unban-user", body);
	return data;
}

async function adminImpersonateUser(
	body: AdminImpersonateUserBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>(
		"/api/auth/admin/impersonate-user",
		body,
	);
	return data;
}

async function adminStopImpersonating(): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>(
		"/api/auth/admin/stop-impersonating",
		{},
	);
	return data;
}

async function adminListUserSessions(
	body: AdminListUserSessionsBody,
): Promise<AdminListUserSessionsResponse> {
	const { data } = await api.post<AdminListUserSessionsResponse>(
		"/api/auth/admin/list-user-sessions",
		body,
	);
	return data;
}

async function adminRevokeUserSession(
	body: AdminRevokeUserSessionBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>(
		"/api/auth/admin/revoke-user-session",
		body,
	);
	return data;
}

async function adminRevokeUserSessions(
	body: AdminRevokeUserSessionsBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>(
		"/api/auth/admin/revoke-user-sessions",
		body,
	);
	return data;
}

async function adminRemoveUser(
	body: AdminRemoveUserBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>("/api/auth/admin/remove-user", body);
	return data;
}

async function adminSetUserPassword(
	body: AdminSetUserPasswordBody,
): Promise<OkResponse> {
	const { data } = await api.post<OkResponse>(
		"/api/auth/admin/set-user-password",
		body,
	);
	return data;
}

async function adminHasPermission(
	body: AdminHasPermissionBody,
): Promise<AdminHasPermissionResponse> {
	const { data } = await api.post<AdminHasPermissionResponse>(
		"/api/auth/admin/has-permission",
		body,
	);
	return data;
}

// ──────────────────────────────────────────────
// React Query hooks
// ──────────────────────────────────────────────

export function useGetSession() {
	return useQuery({
		queryKey: authKeys.getSession(),
		queryFn: getSession,
	});
}

export function useSignInSocial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signInSocial,
		onSuccess: (res) => {
			if (res.redirect && res.url) {
				window.location.href = res.url;
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useSignOut() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: signOut,
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authKeys.all });
		},
	});
}

export function useSignUpEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: signUpEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useSignInEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: signInEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useResetPassword() {
	return useMutation({
		mutationFn: resetPassword,
	});
}

export function useVerifyPassword() {
	return useMutation({
		mutationFn: verifyPassword,
	});
}

export function useVerifyEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			token,
			callbackURL,
		}: {
			token: string;
			callbackURL?: string;
		}) => verifyEmail(token, callbackURL),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useSendVerificationEmail() {
	return useMutation({
		mutationFn: sendVerificationEmail,
	});
}

export function useChangeEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: changeEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useChangePassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: authKeys.all });
		},
	});
}

export function useRequestPasswordReset() {
	return useMutation({
		mutationFn: requestPasswordReset,
	});
}

export function useListSessions() {
	return useQuery({
		queryKey: authKeys.listSessions(),
		queryFn: listSessions,
	});
}

export function useRevokeSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: revokeSession,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.listSessions() });
		},
	});
}

export function useRevokeSessions() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: revokeSessions,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useRevokeOtherSessions() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: revokeOtherSessions,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.listSessions() });
		},
	});
}

export function useLinkSocial() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: linkSocial,
		onSuccess: (res) => {
			if (res.redirect && res.url) {
				window.location.href = res.url;
			}
			queryClient.invalidateQueries({ queryKey: authKeys.listAccounts() });
		},
	});
}

export function useListAccounts() {
	return useQuery({
		queryKey: authKeys.listAccounts(),
		queryFn: listAccounts,
	});
}

export function useUnlinkAccount() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: unlinkAccount,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.listAccounts() });
		},
	});
}

export function useRefreshToken() {
	return useMutation({
		mutationFn: refreshToken,
	});
}

export function useGetAccessToken() {
	return useMutation({
		mutationFn: getAccessToken,
	});
}

export function useAccountInfo() {
	return useQuery({
		queryKey: authKeys.accountInfo(),
		queryFn: getAccountInfo,
	});
}

export function useCheckOk() {
	return useQuery({
		queryKey: ["auth", "ok"] as const,
		queryFn: checkOk,
	});
}

// ──────────────────────────────────────────────
// Organization React Query hooks
// ──────────────────────────────────────────────

export function useGenerateOrgCode() {
	return useMutation({
		mutationFn: generateOrgCode,
	});
}

export function useSetActiveOrganizationOnSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setActiveOrganizationOnSession,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useCompleteOnboarding() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: completeOnboarding,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useCreateOrganization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
		},
	});
}

export function useUpdateOrganization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
		},
	});
}

export function useDeleteOrganization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.list() });
		},
	});
}

export function useSetActiveOrganization() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setActiveOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useGetOrganization() {
	return useQuery({
		queryKey: organizationKeys.active(),
		queryFn: getOrganization,
	});
}

export function useListOrganizations() {
	return useQuery({
		queryKey: organizationKeys.list(),
		queryFn: listOrganizations,
	});
}

export function useListOrganizationMembers(
	params: ListOrganizationMembersQuery = {},
) {
	return useQuery({
		queryKey: organizationKeys.members(params),
		queryFn: () => listOrganizationMembers(params),
	});
}

export function useInviteOrganizationMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: inviteOrganizationMember,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: organizationKeys.invitations(),
			});
			queryClient.invalidateQueries({ queryKey: ["org-invitations-v1"] });
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
		},
	});
}

export function useCancelOrganizationInvitation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelOrganizationInvitation,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: organizationKeys.invitations(),
			});
			queryClient.invalidateQueries({ queryKey: ["org-invitations-v1"] });
		},
	});
}

export function useAcceptOrganizationInvitation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: acceptOrganizationInvitation,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
			queryClient.invalidateQueries({
				queryKey: organizationKeys.userInvitations(),
			});
			queryClient.invalidateQueries({ queryKey: authKeys.getSession() });
		},
	});
}

export function useGetOrganizationInvitation(invitationId: string) {
	return useQuery({
		queryKey: organizationKeys.invitation(invitationId),
		queryFn: () => getOrganizationInvitation(invitationId),
		enabled: !!invitationId,
	});
}

export function useRejectOrganizationInvitation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: rejectOrganizationInvitation,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: organizationKeys.invitations(),
			});
			queryClient.invalidateQueries({
				queryKey: organizationKeys.userInvitations(),
			});
		},
	});
}

export function useListOrganizationInvitations() {
	return useQuery({
		queryKey: organizationKeys.invitations(),
		queryFn: listOrganizationInvitations,
	});
}

export function useListUserOrganizationInvitations() {
	return useQuery({
		queryKey: organizationKeys.userInvitations(),
		queryFn: listUserOrganizationInvitations,
	});
}

export function useGetActiveOrganizationMember(options?: {
	enabled?: boolean;
}) {
	return useQuery({
		queryKey: organizationKeys.activeMember(),
		queryFn: getActiveOrganizationMember,
		enabled: options?.enabled ?? true,
	});
}

export function useCheckOrganizationSlug() {
	return useMutation({
		mutationFn: checkOrganizationSlug,
	});
}

export function useRemoveOrganizationMember() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: removeOrganizationMember,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: organizationKeys.all });
		},
	});
}

// ──────────────────────────────────────────────
// Admin React Query hooks
// ──────────────────────────────────────────────

export function useAdminListUsers(params?: AdminListUsersQuery) {
	return useQuery({
		queryKey: adminKeys.users(),
		queryFn: () => adminListUsers(params ?? {}),
	});
}

export function useAdminGetUser(params: AdminGetUserQuery) {
	const idOrEmail = params.id ?? params.email ?? "";
	return useQuery({
		queryKey: adminKeys.user(idOrEmail),
		queryFn: () => adminGetUser(params),
		enabled: !!idOrEmail,
	});
}

export function useAdminSetUserRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminSetUserRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.users() });
		},
	});
}

export function useAdminBanUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminBanUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.users() });
		},
	});
}

export function useAdminUnbanUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminUnbanUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.users() });
		},
	});
}

export function useAdminImpersonateUser() {
	return useMutation({
		mutationFn: adminImpersonateUser,
	});
}

export function useAdminStopImpersonating() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminStopImpersonating,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});
}

export function useAdminListUserSessions() {
	return useMutation({
		mutationFn: adminListUserSessions,
	});
}

export function useAdminRevokeUserSession() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminRevokeUserSession,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.all });
		},
	});
}

export function useAdminRevokeUserSessions() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminRevokeUserSessions,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.all });
		},
	});
}

export function useAdminRemoveUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminRemoveUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminKeys.users() });
		},
	});
}

export function useAdminSetUserPassword() {
	return useMutation({
		mutationFn: adminSetUserPassword,
	});
}

export function useAdminHasPermission() {
	return useMutation({
		mutationFn: adminHasPermission,
	});
}
