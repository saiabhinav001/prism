import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <div className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
                <Icons.logo className="h-8 w-8" />
                <span className="hidden font-bold sm:inline-block text-lg">PRISM</span>
            </Link>
        </div>
    )
}
