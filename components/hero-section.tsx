import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialSigninBtn } from "./social-signin-btn";

export function HeroSection() {
	return (
		<section className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-24 container">
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12">
				<div className="flex flex-col gap-6">
					<Badge
						variant="secondary"
						className="w-fit uppercase tracking-widest">
						KPI management for government
					</Badge>
					<h1 className="font-(family-name:--font-public-sans) text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
						Performance that stays accountable from cycle to report
					</h1>
					<p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						Shresth helps Indian Government organisations standardise KPI
						cycles, automate locking and compliance, and publish structured
						rankings and reports—so leadership decisions rest on consistent,
						auditable data.
					</p>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<SocialSigninBtn />
						<Link
							href="#"
							data-slot="button"
							data-variant="default"
							data-size="lg"
							className={cn(
								buttonVariants({ variant: "default", size: "lg" }),
							)}>
							Demo
						</Link>
					</div>
				</div>
				<Card className="border-0 rounded-none bg-primary text-primary-foreground shadow-[0_16px_48px_-4px_rgba(26,28,24,0.08)] hover:shadow-[0_16px_48px_-4px_rgba(26,28,24,0.08)]">
					<CardHeader className="gap-3">
						<Badge
							variant="secondary"
							className="w-fit bg-secondary text-secondary-foreground uppercase tracking-widest">
							Active window
						</Badge>
						<CardTitle className="font-(family-name:--font-public-sans) text-xl font-semibold text-primary-foreground">
							FY25–Q2 review
						</CardTitle>
						<CardDescription className="text-primary-foreground/70">
							Submissions validated, flags triaged, and rankings ready for
							publication on schedule.
						</CardDescription>
					</CardHeader>
					<CardContent className="gap-4 text-sm text-primary-foreground/85">
						<p>
							Align departments on one calendar, one template library, and one
							audit trail—from first entry to final sign-off.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
