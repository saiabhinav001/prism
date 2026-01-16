"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthRedirect() {
    const router = useRouter()

    useEffect(() => {
        // Intelligent Routing: If already logged in, go to dashboard
        if (typeof window !== 'undefined' && localStorage.getItem("token")) {
            router.push("/dashboard")
        }
    }, [router])

    return null
}
