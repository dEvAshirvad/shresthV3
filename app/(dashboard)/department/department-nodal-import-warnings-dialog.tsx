"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DepartmentNodalImportError } from "@/queries/departments";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	errors: DepartmentNodalImportError[];
};

export function DepartmentNodalImportWarningsDialog({
	open,
	onOpenChange,
	errors,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg gap-0 p-0 sm:max-w-md">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle>Nodal email not assigned</DialogTitle>
					<DialogDescription>
						Departments were upserted, but these nodal emails did not match an
						organization member. Invite users first, then re-import or assign
						from the department row menu.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-64 px-6">
					<ul className="text-muted-foreground space-y-2 pr-4 pb-4 text-xs">
						{errors.map((e, i) => (
							<li key={`${e.slug}-${e.email}-${i}`}>
								<span className="font-mono text-foreground">{e.slug}</span> ·{" "}
								<span className="font-mono">{e.email}</span>
								<br />
								<span>{e.reason}</span>
							</li>
						))}
					</ul>
				</ScrollArea>
				<DialogFooter className="p-6 pt-2">
					<Button type="button" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
