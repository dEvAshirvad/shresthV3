import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"group/badge inline-flex h-auto min-h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
	{
		variants: {
			variant: {
				default:
					"bg-secondary text-secondary-foreground [a]:hover:bg-secondary/90",
				secondary: "bg-accent text-muted-foreground [a]:hover:bg-accent/90",
				success:
					"bg-chart-1/15 text-chart-1 [a]:hover:bg-chart-1/25 dark:bg-chart-1/20 dark:text-chart-1",
				destructive:
					"bg-chart-4 text-primary-foreground [a]:hover:bg-chart-4/90",
				outline:
					"border-border/40 bg-background text-foreground [a]:hover:bg-muted",
				ghost:
					"bg-transparent text-muted-foreground hover:bg-muted dark:hover:bg-muted/50",
				link: "border-0 bg-transparent px-0 py-0 text-primary underline-offset-4 hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant = "default",
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
