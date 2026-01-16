"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { API_URL } from "@/lib/api-config"

interface User {
    id: number
    email: string
    full_name?: string
    avatar_url?: string
    bio?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Load from cache on mount only
        const cachedUser = localStorage.getItem("user_cache")
        if (cachedUser && !user) {
            try {
                setUser(JSON.parse(cachedUser))
            } catch (e) {
                console.error("Failed to parse user cache", e)
            }
        }
    }, [])

    useEffect(() => {
        const urlToken = searchParams?.get("token")
        let token = localStorage.getItem("token")

        // If we have a token in URL, use it (OAuth callback)
        if (urlToken) {
            token = urlToken
            // Optionally save it immediately to avoid race with TokenHandler
            localStorage.setItem("token", urlToken)
            document.cookie = `token=${urlToken}; path=/; max-age=604800; SameSite=Lax`
        }

        if (!token) {
            // Check if we lost the token but have it in cookie? (Rare)
            // Or if we are in a loop.
            setLoading(false)
            router.push("/login")
            return
        }

        // Ensure cookie is synced even if we came from localStorage
        if (typeof document !== 'undefined' && !document.cookie.includes("token=")) {
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`
        }

        // Optimistic: If we have cache, don't show loading
        if (localStorage.getItem("user_cache")) {
            setLoading(false)
        }

        fetch(`${API_URL}/api/v1/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
                throw new Error("Failed to fetch user")
            })
            .then((data) => {
                setUser(data)
                // Update cache
                localStorage.setItem("user_cache", JSON.stringify(data))

                // Intelligent Routing: Set cookie for middleware
                document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`

                setLoading(false)
            })
            .catch((err) => {
                console.error("Auth Validation Failed:", err)
                // If network error but we have cache, keep user logged in for now (optimistic)
                // Only logout if 401 explicitly? 
                // For now, only logout if we DON'T have a cached user, or if error is definitely 401
                if (!localStorage.getItem("user_cache")) {
                    localStorage.removeItem("token")
                    router.push("/login")
                }
                setLoading(false)
            })
    }, [router, searchParams])

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user_cache")
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
