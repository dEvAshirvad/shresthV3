import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { ApiSuccessEnvelope } from "@/queries/employee";

const BASE = "/api/v1/staff";

export type StaffMe = {
	id: string;
	name: string;
	empId: string;
	phone: string;
	email?: string;
	departmentRole: string;
	department: {
		id: string;
		name: string;
		slug: string;
	};
};

export type StaffPeriodScore = {
	obtainedMarks: number;
	totalMarks: number;
	rank: number;
};

export type StaffPeriod = {
	id: string;
	name: string;
	key: string;
	startDate?: string;
	endDate?: string;
	status: string;
	myScore?: StaffPeriodScore;
};

export type StaffRankingScope = {
	scope: string;
	obtainedMarks: number;
	totalMarks: number;
	rank: number;
	role?: string;
	departmentId?: string;
};

export type StaffPeriodSummary = {
	periodId: string;
	employeeId: string;
	department: StaffRankingScope | null;
	overall: StaffRankingScope | null;
};

export type StaffCohortPeer = {
	employeeId: string;
	employeeName: string;
	role?: string;
	obtainedMarks: number;
	totalMarks: number;
	rank: number;
	isSelf: boolean;
};

export type StaffPeriodCohort = {
	periodId: string;
	departmentId?: string;
	role?: string;
	cohortSize: number;
	self: StaffCohortPeer;
	top: StaffCohortPeer[];
	bottom: StaffCohortPeer[];
};

export const staffKeys = {
	all: ["staff"] as const,
	me: () => [...staffKeys.all, "me"] as const,
	periods: () => [...staffKeys.all, "periods"] as const,
	summary: (periodId: string) =>
		[...staffKeys.all, "summary", periodId] as const,
	cohort: (periodId: string) =>
		[...staffKeys.all, "cohort", periodId] as const,
};

export async function getStaffMe(): Promise<
	ApiSuccessEnvelope<{ me: StaffMe; message: string }>
> {
	const { data } = await api.get(`${BASE}/me`);
	return data;
}

export async function listStaffPeriods(): Promise<
	ApiSuccessEnvelope<{ periods: StaffPeriod[]; message: string }>
> {
	const { data } = await api.get(`${BASE}/periods`);
	return data;
}

export async function getStaffPeriodSummary(
	periodId: string,
): Promise<ApiSuccessEnvelope<{ summary: StaffPeriodSummary; message: string }>> {
	const { data } = await api.get(`${BASE}/periods/${periodId}/summary`);
	return data;
}

export async function getStaffPeriodCohort(
	periodId: string,
): Promise<ApiSuccessEnvelope<{ cohort: StaffPeriodCohort; message: string }>> {
	const { data } = await api.get(`${BASE}/periods/${periodId}/cohort`);
	return data;
}

export function useStaffMe(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: staffKeys.me(),
		queryFn: getStaffMe,
		enabled: options?.enabled ?? true,
	});
}

export function useStaffPeriods(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: staffKeys.periods(),
		queryFn: listStaffPeriods,
		enabled: options?.enabled ?? true,
	});
}

export function useStaffPeriodSummary(
	periodId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: staffKeys.summary(periodId),
		queryFn: () => getStaffPeriodSummary(periodId),
		enabled: (options?.enabled ?? true) && Boolean(periodId),
	});
}

export function useStaffPeriodCohort(
	periodId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: staffKeys.cohort(periodId),
		queryFn: () => getStaffPeriodCohort(periodId),
		enabled: (options?.enabled ?? true) && Boolean(periodId),
	});
}
