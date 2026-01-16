"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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
        }

        if (!token) {
            setLoading(false)
            // Only redirect if we are not already on login page? 
            // Actually router.push might be annoying if we are just checking auth status.
            // But strict logic: if no token, go to login.
            // router.push("/login") 
            // WARN: This might cause infinite redirect loop if purely relying on this.
            // kept original logic:
            router.push("/login")
            return
        }

        fetch("http://127.0.0.1:8000/api/v1/auth/me", {
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
            })
            .catch((err) => {
                console.error(err)
                localStorage.removeItem("token")
                localStorage.removeItem("user_cache")
                router.push("/login")
            })
            .finally(() => {
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
