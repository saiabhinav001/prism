import { MainNav } from "@/components/main-nav"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { TokenHandler } from "@/components/token-handler"
import { Suspense } from "react"

import { AuthProvider } from "@/components/auth-provider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={null}>
            <AuthProvider>
                <div className="flex min-h-screen flex-col bg-background" suppressHydrationWarning>
                    <TokenHandler />

                    {/* Header */}
                    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
                        <div className="flex h-16 items-center px-6 lg:px-8">
                            <MobileNav />
                            <div className="mr-8 hidden md:flex">
                                <MainNav />
                            </div>
                            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                                <div className="w-full flex-1 md:w-auto md:flex-none">
                                    {/* Search or other usage */}
                                </div>
                                <UserNav />
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-0 lg:grid-cols-[240px_1fr] print:block">
                        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r border-border/40 bg-background print:hidden">
                            <div className="h-full py-6 px-4 lg:py-8 lg:px-6">
                                <DashboardNav />
                            </div>
                        </aside>
                        <main className="flex w-full flex-col overflow-hidden p-6 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </AuthProvider>
        </Suspense>
    )
}
