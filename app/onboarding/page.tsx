import { Suspense } from "react";

import { ProtectedRoute } from "@/components/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

import { OnboardingWizard } from "./onboarding-wizard";

function OnboardingWizardFallback() {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
			<Skeleton className="mx-auto h-8 w-64" />
			<Skeleton className="h-96 w-full rounded-xl" />
		</div>
	);
}

export default function OnboardingPage() {
	return (
		<ProtectedRoute requireOnboarded={false}>
			<div className="container flex min-h-[70vh] flex-col gap-10 py-12 md:py-16">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="font-(family-name:--font-public-sans) text-3xl font-bold tracking-tight md:text-4xl">
						Welcome — connect your organization
					</h1>
					<p className="text-muted-foreground mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed md:text-base">
						Most people join through an invitation. Only create a new
						organization if you are the one setting it up from scratch.
					</p>
				</div>
				<Suspense fallback={<OnboardingWizardFallback />}>
					<OnboardingWizard />
				</Suspense>
			</div>
		</ProtectedRoute>
	);
}
