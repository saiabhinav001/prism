export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app") && API_URL.includes("localhost")) {
    console.warn("CRITICAL CONFIG ERROR: You are on Vercel but API_URL is localhost. You forgot to set NEXT_PUBLIC_API_URL in Vercel Environment Variables.")
}
