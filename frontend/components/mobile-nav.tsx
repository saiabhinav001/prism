"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

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
            title: "Settings",
            href: "/dashboard/settings",
            icon: "settings",
        },
    ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                    <Icons.menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 bg-zinc-950 border-r-zinc-800 text-white">
                <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setOpen(false)}
                >
                    <Icons.logo className="mr-2 h-6 w-6" />
                    <span className="font-bold">PRISM</span>
                </Link>
                <div className="flex flex-col space-y-3 mt-8">
                    {items.map(item => {
                        const Icon = Icons[item.icon as keyof typeof Icons] || Icons.logo
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors",
                                    pathname === item.href ? "bg-zinc-800 text-white" : "text-zinc-400"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}
