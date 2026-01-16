import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "@/components/user-auth-form"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const metadata: Metadata = {
    title: "Login - PRISM",
    description: "Login to your account",
}

export default function LoginPage() {
    const router = useRouter()

    useEffect(() => {
        // Intelligent Routing: If already logged in, go to dashboard
        if (localStorage.getItem("token")) {
            router.push("/dashboard")
        }
    }, [router])

    return (
        // Suppress hydration warning to ignore browser extension injections (like screen recorders)
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-black" suppressHydrationWarning>
            <Link
                href="/"
                className="absolute right-4 top-4 md:right-8 md:top-8 z-20 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                suppressHydrationWarning
            >
                Back to Home
            </Link>
            <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white dark:border-r border-zinc-800 lg:flex overflow-hidden">
                <div className="absolute inset-0 bg-black" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />

                <div className="relative z-20 flex items-center text-lg font-bold tracking-tight">
                    <Icons.logo className="mr-2 h-8 w-8 text-white" />
                    <span className="text-xl tracking-tight">PRISM</span>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-white/10 pl-6 backdrop-blur-sm py-2">
                        <p className="text-xl font-light italic leading-relaxed text-zinc-200/90">
                            &ldquo;Reviewing code should feel less like a chore and more like a conversation with an expert. PRISM brings that expertise to every pull request.&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-zinc-400 pt-2">The PRISM Philosophy</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black lg:hidden -z-10" />
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mx-auto w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl backdrop-blur-md mb-4 lg:hidden">
                            <Icons.logo className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to access the workspace
                        </p>
                    </div>
                    <UserAuthForm />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By continuing, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-white transition-colors"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
