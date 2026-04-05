import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";
import { StepsSection } from "@/components/steps-section";
import { Footer } from "@/components/footer";
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
import { Separator } from "@/components/ui/separator";
import SmoothScroll from "@/components/smooth-scroll";
export default function Home() {
	return (
		<SmoothScroll>
			<div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
				<Navbar />
				<main className="flex flex-1 flex-col">
					<HeroSection />
					<section
						id="features"
						className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-20 container">
						<div className="flex flex-col gap-10 ">
							<div className="flex max-w-2xl flex-col gap-3">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									Highlights
								</p>
								<h2 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight sm:text-4xl">
									Built for programme delivery and accountability
								</h2>
								<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
									Explore the capabilities that help teams move from ad-hoc
									spreadsheets to governed KPI cycles.
								</p>
							</div>
							<FeaturesGrid />
						</div>
					</section>
					<section
						id="how-it-works"
						className="border-b border-border/40 bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 lg:py-20 container">
						<div className="flex flex-col gap-10">
							<div className="flex max-w-2xl flex-col gap-3">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									How it works
								</p>
								<h2 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight sm:text-4xl">
									From configuration to published rankings
								</h2>
								<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
									A clear sequence so administrators, reviewers, and data owners
									know what happens next.
								</p>
							</div>
							<StepsSection />
						</div>
					</section>
					<section className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-20 container">
						<div className="flex flex-col gap-10">
							<div className="flex max-w-2xl flex-col gap-3">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									Product depth
								</p>
								<h2 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight sm:text-4xl">
									Everything you need to run KPI programmes at scale
								</h2>
							</div>
							<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
								<Card className="transition-shadow hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]">
									<CardHeader>
										<CardTitle className="font-(family-name:--font-public-sans) text-xl font-semibold">
											Reporting &amp; disclosure
										</CardTitle>
										<CardDescription className="text-base leading-relaxed">
											Produce leadership packs, department comparisons, and
											exportable tables suited to briefings and statutory
											reporting—without re-keying numbers across systems.
										</CardDescription>
									</CardHeader>
								</Card>
								<Card className="bg-accent transition-shadow hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]">
									<CardHeader>
										<CardTitle className="font-(family-name:--font-public-sans) text-xl font-semibold">
											Data quality by design
										</CardTitle>
										<CardDescription className="text-base leading-relaxed">
											Validation rules, mandatory fields, and reviewer workflows
											reduce rework and keep rankings credible when programmes
											are under scrutiny.
										</CardDescription>
									</CardHeader>
								</Card>
								<Card className="lg:col-span-2 transition-shadow hover:shadow-[0_8px_32px_0_rgba(26,28,24,0.06)]">
									<CardHeader>
										<CardTitle className="font-(family-name:--font-public-sans) text-xl font-semibold">
											Governance without gridlock
										</CardTitle>
										<CardDescription className="text-base leading-relaxed">
											Separate configuration from submission, route exceptions
											through approvals, and preserve an audit trail that stands
											up to internal review and external oversight.
										</CardDescription>
									</CardHeader>
								</Card>
							</div>
						</div>
					</section>
					<section className="border-b border-border/40 bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 lg:py-20 container">
						<div className="flex flex-col gap-8">
							<div className="flex flex-col gap-3">
								<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
									Trust
								</p>
								<h2 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight sm:text-4xl">
									Designed for public-sector governance
								</h2>
							</div>
							<Card>
								<CardHeader className="gap-4">
									<div className="flex flex-wrap gap-2">
										<Badge variant="outline">Audit-minded workflows</Badge>
										<Badge variant="outline">Role separation</Badge>
										<Badge variant="outline">Structured outputs</Badge>
									</div>
									<CardTitle className="font-(family-name:--font-public-sans) text-lg font-semibold">
										Accountability by default
									</CardTitle>
									<CardDescription className="text-base leading-relaxed">
										Shresth is shaped around periodic reviews, sign-offs, and
										publishable outcomes—so performance conversations stay tied
										to evidence, not anecdotes.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Separator />
									<p className="pt-6 text-sm leading-relaxed text-muted-foreground">
										Deployments can align with your organisation&apos;s IT and
										security policies, including access control expectations for
										sensitive programme data.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>
					<section className="bg-primary px-6 py-16 text-primary-foreground sm:px-8 lg:px-10 lg:py-20 container">
						<div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
							<div className="flex max-w-xl flex-col gap-3">
								<h2 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight sm:text-4xl">
									Ready to align your KPI programme?
								</h2>
								<p className="text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
									Start onboarding your teams and move from fragmented tracking
									to one governed rhythm.
								</p>
							</div>
							<div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
								<Link
									href="/signup"
									data-slot="button"
									data-variant="secondary"
									data-size="lg"
									className={cn(
										buttonVariants({ variant: "secondary", size: "lg" }),
										"bg-secondary text-secondary-foreground shadow-[0_16px_48px_-4px_rgba(26,28,24,0.08)]",
									)}>
									Get Started
								</Link>
								<Link
									href="/login"
									data-slot="button"
									data-variant="outline"
									data-size="lg"
									className={cn(
										buttonVariants({ variant: "outline", size: "lg" }),
										"border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
									)}>
									Sign in
								</Link>
							</div>
						</div>
					</section>
				</main>
				<Footer />
			</div>
		</SmoothScroll>
	);
}
