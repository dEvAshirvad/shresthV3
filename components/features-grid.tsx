"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
	{
		id: "1",
		title: "Standardized KPI Cycles",
		description:
			"Align ministries and attached offices on common review periods, locking windows, and submission rules so performance data is comparable across programmes.",
	},
	{
		id: "2",
		title: "Automated Locking & Compliance",
		description:
			"Enforce cut-off dates for data entry and approvals with audit-friendly trails that reduce last-minute edits and protect ranking integrity.",
	},
	{
		id: "3",
		title: "Structured Reports & Rankings",
		description:
			"Generate consolidated dashboards, department scorecards, and publishable rankings from validated submissions—ready for leadership reviews.",
	},
	{
		id: "4",
		title: "Role-Based Oversight",
		description:
			"Separate data owners, reviewers, and administrators so accountability is clear while sensitive programme data stays on a need-to-know basis.",
	},
	{
		id: "5",
		title: "Template Library",
		description:
			"Reuse approved indicator definitions and measurement units across schemes, cutting rework when new cycles or programmes are onboarded.",
	},
	{
		id: "6",
		title: "Evidence & Documentation",
		description:
			"Attach supporting documents and notes to indicators so assessments are defensible during audits and parliamentary follow-up.",
	},
];

export function FeaturesGrid() {
	return (
		<div className="grid gap-6 md:grid-cols-3">
			{FEATURES.map((feature, index) => (
				<Card
					key={feature.id}
					className={cn(
						"transition-shadow hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]",
						index === 0 && "md:col-span-2",
					)}>
					<CardHeader>
						<CardTitle className="font-(family-name:--font-public-sans) text-lg font-semibold">
							{feature.title}
						</CardTitle>
						<CardDescription className="text-base leading-relaxed">
							{feature.description}
						</CardDescription>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
