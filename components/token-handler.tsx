"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function TokenHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            // Store token in localStorage
            localStorage.setItem("token", token)
            // Remove token from URL
            router.replace("/dashboard")
        }
    }, [searchParams, router])

    return null
}
