import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                solid: "border-transparent text-white",
            },
            colorVariant: {
                default: "bg-slate-700",
                green: "bg-green-600/80 border-green-500/50",
                blue: "bg-blue-600/80 border-blue-500/50",
                sky: "bg-sky-600/80 border-sky-500/50"
            }
        },
        defaultVariants: {
            variant: "default",
            colorVariant: "default"
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, colorVariant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, colorVariant }), className)} {...props} />
    )
}

export { Badge, badgeVariants } 