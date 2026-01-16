"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

const items = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "Repositories",
        href: "/dashboard/repositories",
        icon: "repositories",
    },
    {
        title: "Pull Requests",
        href: "/dashboard/pull-requests",
        icon: "pullRequests",
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: "settings",
    },
]

export function DashboardNav() {
    const path = usePathname()

    if (!items?.length) {
        return null
    }

    return (
        <nav className="grid items-start gap-2">
            {items.map((item, index) => {
                const Icon = Icons[item.icon as keyof typeof Icons] || Icons.logo
                return (
                    <Link
                        key={index}
                        href={item.href}
                    >
                        <span
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out",
                                path === item.href ? "bg-accent/80 text-accent-foreground shadow-sm" : "transparent text-zinc-400"
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            <span>{item.title}</span>
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
