"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Building2, Mail, UserPlus } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	isValidIstBusinessYmd,
	istBusinessYmdToUtcIsoInstant,
	istCurrentMonthFirstDayYmd,
} from "@/lib/business-date";
import { cn } from "@/lib/utils";
import {
	useAcceptOrganizationInvitation,
	useCompleteOnboarding,
	useCreateOrganization,
	useGetActiveOrganizationMember,
	useGenerateOrgCode,
	useListOrganizations,
	useListUserOrganizationInvitations,
	useRejectOrganizationInvitation,
	useSetActiveOrganizationOnSession,
	type AcceptOrganizationInvitationResponse,
	type Organization,
	type UserOrganizationInvitation,
} from "@/queries/auth";
import {
	useStartKpiPeriods,
	useUpdateKpiPeriodConfig,
} from "@/queries/periods";
import { amINodalAssigned } from "@/queries/nodal";

const STEPS = ["Connect", "KPI periods", "Finish"] as const;

type SetupMode = "choose" | "join" | "create";

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-");
}

function getApiErrorMessage(err: unknown): string {
	if (isAxiosError(err)) {
		const data = err.response?.data as
			| {
					message?: string;
					title?: string;
					data?: { message?: string; title?: string };
			  }
			| undefined;
		return (
			data?.data?.message ??
			data?.data?.title ??
			data?.message ??
			data?.title ??
			err.message ??
			"Request failed"
		);
	}
	if (err instanceof Error) return err.message;
	return "Something went wrong";
}

function isInviteActionable(inv: UserOrganizationInvitation): boolean {
	const s = inv.status.toLowerCase();
	return (
		s === "pending" ||
		s === "sent" ||
		s === "pending_acceptance" ||
		s === "open"
	);
}

function normalizeOrgIdRef(
	raw:
		| string
		| { _id?: string; id?: string }
		| undefined
		| null,
): string | null {
	if (raw == null) return null;
	if (typeof raw === "string") return raw.length > 0 ? raw : null;
	const id = raw._id ?? raw.id;
	return typeof id === "string" && id.length > 0 ? id : null;
}

/** Accept-invitation API returns `member` / `invitation`, not always nested `organization`. */
function getOrganizationIdFromAcceptResponse(
	res: AcceptOrganizationInvitationResponse,
): string | null {
	const fromOrg = res.organization?.id;
	if (fromOrg) return fromOrg;
	const fromMember = normalizeOrgIdRef(
		res.member?.organizationId as string | { _id?: string } | undefined,
	);
	if (fromMember) return fromMember;
	const fromInvitation = normalizeOrgIdRef(
		res.invitation?.organizationId as string | { _id?: string } | undefined,
	);
	if (fromInvitation) return fromInvitation;
	return null;
}

/** ISO date string → YYYY-MM-DD (stable for SSR vs client; avoids `toLocaleDateString` hydration issues). */
function formatInvitationExpiryDate(iso: string): string {
	const day = iso.trim().slice(0, 10);
	return day.length === 10 ? day : iso;
}

export function OnboardingWizard() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { session, refetch } = useAuth();
	const [step, setStep] = useState(0);
	const [setupMode, setSetupMode] = useState<SetupMode>("choose");

	const { data: organizations = [], isLoading: loadingOrgs } =
		useListOrganizations();
	const {
		data: userInvitations = [],
		isLoading: loadingUserInvites,
		isError: userInvitesError,
		refetch: refetchUserInvites,
	} = useListUserOrganizationInvitations();

	const generateOrgCode = useGenerateOrgCode();
	const createOrg = useCreateOrganization();
	const setActiveOnSession = useSetActiveOrganizationOnSession();
	const acceptInvitation = useAcceptOrganizationInvitation();
	const rejectInvitation = useRejectOrganizationInvitation();
	const updatePeriodConfig = useUpdateKpiPeriodConfig();
	const startPeriods = useStartKpiPeriods();
	const completeOnboarding = useCompleteOnboarding();

	const [orgName, setOrgName] = useState("");
	const [orgSlug, setOrgSlug] = useState("");
	const [orgCode, setOrgCode] = useState("");
	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
	const [manualInvitationId, setManualInvitationId] = useState("");

	const [frequencyMonths, setFrequencyMonths] = useState("1");
	const [lockingPeriodDays, setLockingPeriodDays] = useState("2");
	/** YYYY-MM-DD — India business calendar anchor for the first KPI cycle (`PUT /periods/config` before start). */
	const [periodStartDate, setPeriodStartDate] = useState(() =>
		istCurrentMonthFirstDayYmd(),
	);
	const [periodStepDone, setPeriodStepDone] = useState(false);

	const activeOrgId = session?.activeOrganizationId ?? selectedOrgId ?? null;
	const { data: activeMember } = useGetActiveOrganizationMember({
		enabled: Boolean(activeOrgId),
	});

	const canProceedOrg = Boolean(activeOrgId);

	const resolvePostOnboardingPath = useCallback(
		async (
			explicitRole?: string | null,
		): Promise<"/dashboard" | "/not-assigned" | "/templates"> => {
			const role = (
				explicitRole ??
				activeMember?.role ??
				session?.activeOrganizationRole ??
				""
			)
				.toLowerCase()
				.trim();
			if (role !== "nodal") {
				return "/dashboard";
			}
			try {
				const check = await amINodalAssigned();
				if (check.data?.isAssigned === false) return "/not-assigned";
			} catch {
				// If check fails, let dashboard gate re-evaluate and enforce.
			}
			return "/templates";
		},
		[activeMember?.role, session?.activeOrganizationRole],
	);

	const ensureActiveOrg = useCallback(
		async (organizationId: string) => {
			await setActiveOnSession.mutateAsync({
				organizationId,
			});
			await refetch();
		},
		[setActiveOnSession, refetch],
	);

	const invitationIdFromUrl = searchParams.get("invitationId")?.trim() ?? "";

	useEffect(() => {
		if (invitationIdFromUrl) {
			setSetupMode("join");
			setManualInvitationId(invitationIdFromUrl);
		}
	}, [invitationIdFromUrl]);

	const goToPeriodStep = useCallback((organizationId: string) => {
		setSelectedOrgId(organizationId);
		setStep(1);
	}, []);

	const handleSelectExistingOrg = async (org: Organization) => {
		try {
			await ensureActiveOrg(org.id);
			setSelectedOrgId(org.id);
			toast.success("Organization selected");
			goToPeriodStep(org.id);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleAcceptInvite = async (invitationId: string) => {
		try {
			const res = await acceptInvitation.mutateAsync({ invitationId });
			const orgId = getOrganizationIdFromAcceptResponse(res);
			if (!orgId) {
				toast.error(
					"Could not read the organization from the server response. Try again or pick the org from the list below.",
				);
				return;
			}
			await ensureActiveOrg(orgId);
			setSelectedOrgId(orgId);
			await refetchUserInvites();
			await completeOnboarding.mutateAsync();
			await refetch();
			toast.success("Welcome — onboarding complete");
			const landing = await resolvePostOnboardingPath(res.member?.role ?? null);
			router.replace(landing);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleRejectInvite = async (invitationId: string) => {
		try {
			await rejectInvitation.mutateAsync({ invitationId });
			toast.success("Invitation declined");
			await refetchUserInvites();
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleAcceptManualInvitationId = async () => {
		const id = manualInvitationId.trim();
		if (!id) {
			toast.error("Paste an invitation ID");
			return;
		}
		await handleAcceptInvite(id);
	};

	const handleGenerateCode = async () => {
		try {
			const res = await generateOrgCode.mutateAsync({
				name: orgName || undefined,
				slug: orgSlug || undefined,
			});
			setOrgCode(res.data);
			toast.success("Code generated");
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleCreateOrg = async () => {
		const name = orgName.trim();
		const slug = (orgSlug.trim() || slugify(name)).slice(0, 128);
		if (!name || !slug || !orgCode.trim()) {
			toast.error("Enter organization name and code", {
				description: "The code is required to create the organization.",
			});
			return;
		}
		try {
			const created = await createOrg.mutateAsync({
				name,
				slug,
				orgCode: orgCode.trim() || undefined,
				keepCurrentActiveOrganization: false,
			});
			await ensureActiveOrg(created.id);
			setSelectedOrgId(created.id);
			toast.success("Organization created");
			goToPeriodStep(created.id);
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const validatePeriodForm = (): {
		fm: number;
		lp: number;
		startDate: string;
	} | null => {
		const fm = Number.parseInt(frequencyMonths, 10);
		const lp = Number.parseInt(lockingPeriodDays, 10);
		const startDate = periodStartDate.trim();
		if (!Number.isFinite(fm) || fm < 1) {
			toast.error("Frequency must be at least 1 month");
			return null;
		}
		if (!Number.isFinite(lp) || lp < 1) {
			toast.error("Locking window must be at least 1 day");
			return null;
		}
		if (!startDate) {
			toast.error("Choose a calendar anchor date for the first KPI period");
			return null;
		}
		if (!isValidIstBusinessYmd(startDate)) {
			toast.error("Invalid start date (use India business calendar)");
			return null;
		}
		return { fm, lp, startDate };
	};

	const handleSavePeriodConfig = async () => {
		const v = validatePeriodForm();
		if (!v) return;
		try {
			await updatePeriodConfig.mutateAsync({
				frequencyMonths: v.fm,
				lockingPeriodDays: v.lp,
				startDate: istBusinessYmdToUtcIsoInstant(v.startDate, "noon"),
			});
			toast.success("Period configuration saved");
		} catch (e) {
			toast.error(getApiErrorMessage(e));
		}
	};

	const handleStartPeriods = async () => {
		const v = validatePeriodForm();
		if (!v) return;
		try {
			await updatePeriodConfig.mutateAsync({
				frequencyMonths: v.fm,
				lockingPeriodDays: v.lp,
				startDate: istBusinessYmdToUtcIsoInstant(v.startDate, "noon"),
			});
			await startPeriods.mutateAsync();
			setPeriodStepDone(true);
			toast.success("KPI period system started");
		} catch (e) {
			const msg = getApiErrorMessage(e);
			if (
				msg.toLowerCase().includes("already") ||
				msg.includes("PERIOD_ALREADY_STARTED")
			) {
				setPeriodStepDone(true);
				toast.message("Period system was already started — continuing");
				return;
			}
			toast.error(msg);
		}
	};

	const handleFinish = async () => {
		try {
			await completeOnboarding.mutateAsync();
			await refetch();
			toast.success("Welcome onboard");
			const landing = await resolvePostOnboardingPath();
			router.replace(landing);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			toast.error(msg);
		}
	};

	const busy =
		createOrg.isPending ||
		setActiveOnSession.isPending ||
		acceptInvitation.isPending ||
		rejectInvitation.isPending ||
		updatePeriodConfig.isPending ||
		startPeriods.isPending ||
		completeOnboarding.isPending;

	const orgList = useMemo(() => organizations ?? [], [organizations]);

	const pendingInvites = useMemo(
		() => userInvitations.filter(isInviteActionable),
		[userInvitations],
	);

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
			<ol className="flex flex-wrap items-center justify-center gap-2 text-sm">
				{STEPS.map((label, i) => (
					<li key={label} className="flex items-center gap-2">
						{i > 0 && (
							<span className="text-muted-foreground" aria-hidden>
								/
							</span>
						)}
						<button
							type="button"
							disabled={i > step || busy}
							onClick={() => i <= step && setStep(i)}
							className={cn(
								"rounded-full px-3 py-1 font-medium transition-colors",
								i === step
									? "bg-primary text-primary-foreground"
									: i < step
										? "bg-muted text-foreground"
										: "text-muted-foreground",
							)}>
							{i + 1}. {label}
						</button>
					</li>
				))}
			</ol>

			{step === 0 && setupMode === "choose" && (
				<div className="flex flex-col gap-8">
					{loadingOrgs ? (
						<p className="text-muted-foreground text-center text-sm">
							Loading your organizations…
						</p>
					) : orgList.length > 0 ? (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Already a member?</CardTitle>
								<CardDescription>
									If you already belong to an organization, select it to
									continue onboarding — no invitation needed.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="max-h-48 space-y-2 overflow-y-auto">
									{orgList.map((org) => (
										<li key={org.id}>
											<Button
												type="button"
												variant="outline"
												className="h-auto w-full justify-start py-3 text-left"
												disabled={busy}
												onClick={() => handleSelectExistingOrg(org)}>
												<span className="font-medium">{org.name}</span>
												<span className="text-muted-foreground ml-2 text-xs">
													{org.slug}
												</span>
											</Button>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					) : null}

					<div>
						<h2 className="text-foreground mb-2 text-center text-lg font-semibold tracking-tight">
							How do you want to connect?
						</h2>
						<p className="text-muted-foreground mx-auto mb-6 max-w-lg text-center text-sm text-pretty">
							Admins and nodal officers usually join through an invitation — you
							do not need to create a new organization. Choose the path that
							matches your situation.
						</p>
						<div className="grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								disabled={busy}
								onClick={() => setSetupMode("join")}
								className={cn(
									"border-border bg-card hover:bg-muted/50 flex flex-col items-start gap-3 rounded-none border p-6 text-left transition-colors",
									"focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
								)}>
								<span className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-lg">
									<Mail className="size-5" aria-hidden />
								</span>
								<span className="text-base font-semibold">
									Join an organization
								</span>
								<span className="text-muted-foreground text-sm leading-relaxed">
									You were invited (email link) or have a pending invitation as
									staff, nodal, or admin.
								</span>
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => setSetupMode("create")}
								className={cn(
									"border-border bg-card hover:bg-muted/50 flex flex-col items-start gap-3 rounded-none border p-6 text-left transition-colors",
									"focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
								)}>
								<span className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-lg">
									<Building2 className="size-5" aria-hidden />
								</span>
								<span className="text-base font-semibold">
									Create an organization
								</span>
								<span className="text-muted-foreground text-sm leading-relaxed">
									You are the first person setting up KPI for a new org and will
									need an org code.
								</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{step === 0 && setupMode === "join" && (
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between gap-4 ">
							<div>
								<CardTitle>Join an organization</CardTitle>
								<CardDescription>
									Accept an invitation you received, or pick an organization you
									already belong to.
								</CardDescription>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="shrink-0"
								disabled={busy}
								onClick={() => setSetupMode("choose")}>
								Back
							</Button>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						{invitationIdFromUrl ? (
							<div className="bg-muted/50 rounded-lg border border-dashed p-4 text-sm">
								<p className="font-medium">Invitation link</p>
								<p className="text-muted-foreground mt-1">
									We prefilled the invitation ID from your link. Accept below to
									join.
								</p>
							</div>
						) : null}

						{userInvitesError ? (
							<p className="text-muted-foreground text-sm">
								Could not load the invitation list. You can still accept using
								an invitation ID below or choose an organization you already
								belong to.
							</p>
						) : loadingUserInvites ? (
							<p className="text-muted-foreground text-sm">
								Loading invitations…
							</p>
						) : pendingInvites.length > 0 ? (
							<div className="space-y-2">
								<Label>Pending invitations</Label>
								<ul className="space-y-2">
									{pendingInvites.map((inv) => (
										<li
											key={inv.id}
											className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
											<div>
												<p className="font-medium">{inv.organizationName}</p>
												<p className="text-muted-foreground text-xs">
													Role:{" "}
													<span className="text-foreground capitalize">
														{inv.role}
													</span>
													{" · "}
													Expires {formatInvitationExpiryDate(inv.expiresAt)}
												</p>
											</div>
											<div className="flex shrink-0 gap-2">
												<Button
													type="button"
													size="sm"
													disabled={busy}
													onClick={() => handleAcceptInvite(inv.id)}>
													<UserPlus className="mr-1 size-4" aria-hidden />
													Accept
												</Button>
												<Button
													type="button"
													size="sm"
													variant="outline"
													disabled={busy}
													onClick={() => handleRejectInvite(inv.id)}>
													Decline
												</Button>
											</div>
										</li>
									))}
								</ul>
							</div>
						) : (
							<p className="text-muted-foreground text-sm">
								No pending invitations on this account. If you were emailed a
								link, open it while signed in, or paste the invitation ID below.
							</p>
						)}

						{!loadingOrgs && orgList.length > 0 ? (
							<div className="space-y-2">
								<Label>Your organizations</Label>
								<ul className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
									{orgList.map((org) => (
										<li key={org.id}>
											<Button
												type="button"
												variant="outline"
												className="h-auto w-full justify-start py-3 text-left"
												disabled={busy}
												onClick={() => handleSelectExistingOrg(org)}>
												<span className="font-medium">{org.name}</span>
												<span className="text-muted-foreground ml-2 text-xs">
													{org.slug}
												</span>
											</Button>
										</li>
									))}
								</ul>
							</div>
						) : null}

						<div className="space-y-2">
							<Label htmlFor="invite-id">Invitation ID (from email)</Label>
							<div className="flex flex-wrap gap-2">
								<Input
									id="invite-id"
									value={manualInvitationId}
									onChange={(e) => setManualInvitationId(e.target.value)}
									placeholder="Paste invitation ID"
									className="min-w-48 flex-1 font-mono text-sm"
									autoComplete="off"
								/>
								<Button
									type="button"
									disabled={busy || !manualInvitationId.trim()}
									onClick={() => void handleAcceptManualInvitationId()}>
									Accept
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{step === 0 && setupMode === "create" && (
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<div>
								<CardTitle>Create an organization</CardTitle>
								<CardDescription>
									Only use this when you are establishing a new organization. If
									you were invited as nodal or admin, go back and use{" "}
									<strong>Join an organization</strong>.
								</CardDescription>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="shrink-0"
								disabled={busy}
								onClick={() => setSetupMode("choose")}>
								Back
							</Button>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-6">
						<div className="space-y-2">
							<Label htmlFor="org-name">Organization name</Label>
							<Input
								id="org-name"
								value={orgName}
								onChange={(e) => {
									setOrgName(e.target.value);
									if (!orgSlug || orgSlug === slugify(orgName)) {
										setOrgSlug(slugify(e.target.value));
									}
								}}
								placeholder="Acme Foundation"
								autoComplete="organization"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="org-slug">URL slug</Label>
							<Input
								id="org-slug"
								value={orgSlug}
								onChange={(e) => setOrgSlug(slugify(e.target.value))}
								placeholder="acme-foundation"
							/>
						</div>
						<div className="flex flex-wrap items-end gap-2">
							<div className="min-w-0 flex-1 space-y-2">
								<Label htmlFor="org-code">Org code</Label>
								<Input
									id="org-code"
									value={orgCode}
									onChange={(e) => setOrgCode(e.target.value)}
									placeholder="Generate or paste"
								/>
							</div>
							<Button
								type="button"
								variant="secondary"
								disabled={busy || generateOrgCode.isPending}
								onClick={handleGenerateCode}>
								Generate
							</Button>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end pb-6">
						<Button
							type="button"
							disabled={busy || !orgName.trim() || !orgCode.trim()}
							onClick={handleCreateOrg}>
							Create &amp; continue
						</Button>
					</CardFooter>
				</Card>
			)}

			{step === 1 && (
				<Card>
					<CardHeader>
						<CardTitle>KPI period settings</CardTitle>
						<CardDescription>
							Set the <strong>anchor date</strong> for the first cycle, how long
							each assessment window runs, and how many days before the next
							start entries freeze. Saving sends{" "}
							<code className="text-xs">PUT /api/v1/periods/config</code> with
							all required fields; <strong>Start period system</strong> saves
							then calls <code className="text-xs">POST /start</code> once.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label htmlFor="period-anchor">
								First period anchor (start date)
							</Label>
							<Input
								id="period-anchor"
								type="date"
								value={periodStartDate}
								onChange={(e) => setPeriodStartDate(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Use the <strong>India business calendar</strong> (Asia/Kolkata).
								The app sends a UTC instant (noon on that day) to the API; the
								server stores UTC-only fields. After go-live, rollover follows
								each period’s stored end date.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="freq">Frequency (months)</Label>
							<Input
								id="freq"
								type="number"
								min={1}
								value={frequencyMonths}
								onChange={(e) => setFrequencyMonths(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="lock">
								Locking window (days before next period start)
							</Label>
							<Input
								id="lock"
								type="number"
								min={1}
								value={lockingPeriodDays}
								onChange={(e) => setLockingPeriodDays(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								While the current date falls in this many full UTC days before
								the next cycle start, the active period becomes locked.
							</p>
						</div>
						{periodStepDone && (
							<p className="text-sm text-green-600 dark:text-green-400">
								Period system is ready. Continue to finish onboarding.
							</p>
						)}
					</CardContent>
					<CardFooter className="flex flex-wrap justify-between gap-2 pb-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setStep(0);
								setSetupMode("choose");
							}}
							disabled={busy}>
							Back
						</Button>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="secondary"
								disabled={busy}
								onClick={handleSavePeriodConfig}>
								Save config
							</Button>
							<Button
								type="button"
								disabled={busy || !canProceedOrg || periodStepDone}
								onClick={handleStartPeriods}>
								{periodStepDone
									? "Period system started"
									: "Start period system"}
							</Button>
							<Button
								type="button"
								disabled={busy || !periodStepDone}
								onClick={() => setStep(2)}>
								Next
							</Button>
						</div>
					</CardFooter>
				</Card>
			)}

			{step === 2 && (
				<Card>
					<CardHeader>
						<CardTitle>Finish setup</CardTitle>
						<CardDescription>
							We will mark your account as onboarded. You can manage
							departments, employees, and KPI templates from the dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						<p>
							Active organization:{" "}
							<span className="text-foreground font-mono text-xs">
								{activeOrgId ?? "—"}
							</span>
						</p>
					</CardContent>
					<CardFooter className="flex justify-between gap-2 pb-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => setStep(1)}
							disabled={busy}>
							Back
						</Button>
						<Button type="button" disabled={busy} onClick={handleFinish}>
							Complete onboarding
						</Button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
}
