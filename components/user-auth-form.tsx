"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api-config"

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const router = useRouter()
    const [isEmailLoading, setIsEmailLoading] = React.useState<boolean>(false)
    const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false)
    const [isSignUp, setIsSignUp] = React.useState<boolean>(false)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [fullName, setFullName] = React.useState("")

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsEmailLoading(true)

        try {
            const endpoint = isSignUp
                ? `${API_URL}/api/v1/auth/signup`
                : `${API_URL}/api/v1/auth/login/access-token`

            const body = isSignUp
                ? JSON.stringify({ email, password, full_name: fullName })
                : new URLSearchParams({ username: email, password }).toString()

            const headers = isSignUp
                ? { "Content-Type": "application/json" }
                : { "Content-Type": "application/x-www-form-urlencoded" }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: body,
            })

            if (!response.ok) {
                const error = await response.json()
                alert(error.detail || "Authentication failed")
                setIsEmailLoading(false)
                return
            }

            const data = await response.json()

            // Store token
            localStorage.setItem("token", data.access_token)

            // Fast SPA Redirect
            router.push("/dashboard")

        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                alert(`Error: ${error.message}`)
            } else {
                alert("Something went wrong. Please try again.")
            }
            setIsEmailLoading(false)
        }
    }

    const handleGitHubLogin = async () => {
        setIsGitHubLoading(true)
        console.log("Attempting GitHub Login via:", `${API_URL}/api/v1/auth/login/github`)

        try {
            // Add a timeout to prevent infinite spinning
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

            const response = await fetch(`${API_URL}/api/v1/auth/login/github`, {
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`Backend Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            if (data.url) {
                console.log("Redirecting to GitHub:", data.url)
                window.location.href = data.url
            } else {
                console.error("No URL returned from backend", data)
                alert("Login Error: No redirect URL received from server.")
                setIsGitHubLoading(false)
            }
        } catch (error) {
            console.error("GitHub login error:", error)

            if (error instanceof DOMException && error.name === 'AbortError') {
                alert("Connection Timeout: The backend is waking up or unreachable. Please try again in 1 minute.")
            } else {
                alert(`Login Failed: ${error instanceof Error ? error.message : "Unknown Error"}\n\nCheck console for details.`)
            }

            setIsGitHubLoading(false)
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    {isSignUp && (
                        <div className="grid gap-1">
                            <Label className="sr-only" htmlFor="name">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Full Name"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isEmailLoading || isGitHubLoading}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-zinc-900/50 border-white/10 focus:border-white/20 h-11"
                                required
                            />
                        </div>
                    )}
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isEmailLoading || isGitHubLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-zinc-900/50 border-white/10 focus:border-white/20 h-11"
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="Password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            disabled={isEmailLoading || isGitHubLoading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-zinc-900/50 border-white/10 focus:border-white/20 h-11"
                            required
                        />
                    </div>
                    <Button disabled={isEmailLoading || isGitHubLoading} className="h-11 bg-white text-black hover:bg-zinc-200 transition-colors font-medium">
                        {isEmailLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isEmailLoading || isGitHubLoading} onClick={handleGitHubLogin} className="h-11 border-white/10 bg-black hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center gap-2">
                {isGitHubLoading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                    <Icons.gitHub className="h-4 w-4" />
                )}
                Continue with GitHub
            </Button>
            <div className="text-center text-sm text-neutral-500 mt-2">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <span
                    className="underline cursor-pointer hover:text-neutral-300"
                    onClick={() => setIsSignUp(!isSignUp)}
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </span>
            </div>
        </div>
    )
}
