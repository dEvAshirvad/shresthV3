import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ReportPeriodActions } from "../report-period-actions";
import { ReportPeriodInsights } from "../report-period-insights";

type PageProps = {
	params: Promise<{ periodId: string }>;
};

export default async function ReportPeriodPage({ params }: PageProps) {
	const { periodId } = await params;

	return (
		<div>
			<Breadcrumb className="mb-2 uppercase text-[0.6875rem] font-medium leading-tight tracking-[0.08em] text-muted-foreground">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/dashboard">System</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="opacity-50 [&>svg]:size-3" />
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/reports">Reports</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="opacity-50 [&>svg]:size-3" />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-foreground">
							Period report
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="font-(family-name:--font-public-sans) text-[2rem] font-bold tracking-tight text-foreground leading-[1.15]">
						Period insights
					</h1>
					<p className="text-muted-foreground mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">
						KPI report snapshot for period{" "}
						<code className="text-foreground rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
							{periodId}
						</code>
						. Full detail is available after the period is closed.
					</p>
				</div>
				<Button variant="outline" size="sm" className="shrink-0 gap-2" asChild>
					<Link href="/reports">
						<ArrowLeft className="size-4" />
						Back to report runs
					</Link>
				</Button>
			</div>

			<div className="mt-8">
				<ReportPeriodActions periodId={periodId} />
			</div>

			<div className="mt-8">
				<ReportPeriodInsights periodId={periodId} />
			</div>
		</div>
	);
}
