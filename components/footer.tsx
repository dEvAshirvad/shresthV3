import Link from "next/link";
export function Footer() {
	return (
		<footer id="contact" className="bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
					<div className="flex flex-col gap-2">
						<p className="font-(family-name:--font-public-sans) text-lg font-bold text-primary">
							Shresth
						</p>
						<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
							KPI management for Indian Government organisations—standardised
							cycles, structured reports, and defensible rankings.
						</p>
					</div>
					<nav className="flex flex-col gap-3 text-sm md:items-end">
						<Link
							href="mailto:contact@shresth.example.gov.in"
							className="text-muted-foreground hover:text-foreground">
							contact@shresth.example.gov.in
						</Link>
						<Link
							href="#features"
							className="text-muted-foreground hover:text-foreground">
							Features
						</Link>
						<Link
							href="#how-it-works"
							className="text-muted-foreground hover:text-foreground">
							How it works
						</Link>
					</nav>
				</div>
				<p className="text-xs uppercase tracking-widest text-muted-foreground">
					© {new Date().getFullYear()} Shresth. For official use in accordance
					with applicable policies.
				</p>
			</div>
		</footer>
	);
}
