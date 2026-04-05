"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
	{
		id: "1",
		title: "Configure periods",
		description:
			"Define financial year segments, review windows, and locking rules that match your organisation’s approval calendar.",
	},
	{
		id: "2",
		title: "Create templates",
		description:
			"Author KPI templates with targets, units, and responsible owners so every department works from the same playbook.",
	},
	{
		id: "3",
		title: "Assign & collect",
		description:
			"Distribute templates, collect submissions within the active window, and track completeness before lock.",
	},
	{
		id: "4",
		title: "Validate & publish",
		description:
			"Run reviews, resolve flags, and publish rankings and reports for leadership and statutory disclosure where required.",
	},
];
export function StepsSection() {
	return (
		<ol className="grid gap-6 md:grid-cols-2">
			{STEPS.map((step, idx) => (
				<li key={step.id}>
					<Card className="h-full transition-shadow hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]">
						<CardHeader className="gap-3">
							<Badge
								variant="secondary"
								className="w-fit uppercase tracking-widest">
								Step {idx + 1}
							</Badge>
							<CardTitle className="font-(family-name:--font-public-sans) text-lg font-semibold">
								{step.title}
							</CardTitle>
							<CardDescription className="text-base leading-relaxed">
								{step.description}
							</CardDescription>
						</CardHeader>
					</Card>
				</li>
			))}
		</ol>
	);
}
