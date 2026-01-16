"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthRedirect() {
    const router = useRouter()

    useEffect(() => {
        // Intelligent Routing: If already logged in, go to dashboard
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token")
            if (token) {
                // Ensure cookie is set for middleware before redirecting
                if (!document.cookie.includes("token=")) {
                    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`
                }
                router.push("/dashboard")
            }
        }
    }, [router])

    return null
}
