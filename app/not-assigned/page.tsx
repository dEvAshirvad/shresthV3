import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotAssignedPage() {
	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Nodal not assigned to any department</CardTitle>
					<CardDescription>
						Your account has nodal role, but it is not assigned to a department
						yet. Unassigned nodals cannot access dashboard modules.
					</CardDescription>
				</CardHeader>
				<CardContent className="text-muted-foreground text-sm leading-relaxed">
					Please contact your organization admin/owner and ask them to assign your
					nodal member to at least one department.
				</CardContent>
				<CardFooter className="flex flex-wrap gap-2">
					<Button asChild>
						<Link href="/onboarding">Back to onboarding</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/dashboard">Retry access</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
