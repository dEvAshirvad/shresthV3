import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center  border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-b border-primary from-primary to-chart-2 text-primary-foreground shadow-[0_16px_48px_-4px_rgba(26,28,24,0.08)] [a]:hover:from-chart-2 [a]:hover:to-chart-2 hover:from-chart-2 hover:to-chart-2 hover:shadow-[0_20px_52px_-4px_rgba(26,28,24,0.1)] active:from-[#003a1b] active:to-[#003a1b] dark:bg-gradient-to-b dark:from-primary dark:to-primary dark:hover:from-primary dark:hover:to-primary dark:active:from-primary/90 dark:active:to-primary/90",
				outline:
					"border-border/40 bg-background text-foreground shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-border dark:bg-background dark:hover:bg-muted",
				secondary:
					"border-border/40 bg-secondary text-foreground shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-border dark:bg-background dark:hover:bg-muted",
				ghost:
					"text-primary shadow-none hover:bg-primary/[0.06] hover:text-primary aria-expanded:bg-primary/[0.06] dark:hover:bg-primary/15",
				destructive:
					"bg-destructive text-primary-foreground shadow-[0_16px_48px_-4px_rgba(186,26,26,0.12)] hover:bg-destructive/90 focus-visible:border-destructive focus-visible:ring-destructive/30 active:bg-destructive/80 dark:focus-visible:ring-destructive/40",
				link: "h-auto min-h-0 rounded-none border-0 bg-transparent p-0 text-primary underline-offset-4 shadow-none hover:bg-transparent hover:underline",
			},
			size: {
				default:
					"min-h-10 gap-1.5 px-5 py-2.5 text-[0.9375rem] font-semibold has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
				xs: "min-h-8 gap-1  px-3 py-1.5 text-xs font-medium in-data-[slot=button-group]: has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "min-h-9 gap-1  px-4 py-2 text-[0.875rem] font-medium in-data-[slot=button-group]: has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "min-h-11 gap-1.5 px-8 py-2.5 text-[0.9375rem] font-semibold has-data-[icon=inline-end]:pr-10 has-data-[icon=inline-start]:pl-10",
				icon: "size-10 min-h-10 min-w-10 p-0",
				"icon-xs":
					"size-8 min-h-8 min-w-8  p-0 in-data-[slot=button-group]: [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9 min-h-9 min-w-9  p-0 in-data-[slot=button-group]:",
				"icon-lg": "size-11 min-h-11 min-w-11 p-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
