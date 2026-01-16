"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    ArrowLeft,
    FileCode2,
    Maximize2,
    Minimize2,
    AlertCircle,
    XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"
import { motion } from "framer-motion"

interface DiffResult {
    diff: string
    title: string
    repo_name: string
    pr_number: number
}

export default function DiffPage() {
    const params = useParams()
    const router = useRouter()
    const [result, setResult] = useState<DiffResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isZenMode, setIsZenMode] = useState(true)

    useEffect(() => {
        const fetchDiff = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    router.push("/login")
                    return
                }

                // params keys match directory names: [repo_id] and [pr_number]
                const res = await fetch(`/api/v1/prs/${params.repo_id}/${params.pr_number}/diff`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setResult(data)
                } else {
                    const err = await res.text()
                    try {
                        const jsonErr = JSON.parse(err)
                        setError(jsonErr.detail || "Failed to load diff")
                    } catch {
                        setError(err || "Failed to load diff")
                    }
                }
            } catch (err) {
                console.error(err)
                setError("Connection error")
            } finally {
                setLoading(false)
            }
        }

        if (params.repo_id && params.pr_number) {
            fetchDiff()
        }
    }, [params.repo_id, params.pr_number, router])


    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#1e1e1e]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                <p className="text-zinc-500 text-sm font-mono">Loading Diff...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#1e1e1e]">
                <div className="rounded-full bg-red-500/10 p-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-300">Unable to Load Diff</h3>
                <p className="text-zinc-500 max-w-md text-center">{error}</p>
                <div className="bg-zinc-800/50 p-4 rounded-lg font-mono text-xs text-red-400 mt-2">
                    Repo: {params.repo_id} | PR: {params.pr_number}
                </div>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        )
    }

    if (!result) return null

    return (
        <div className={cn(
            "flex flex-col h-screen bg-[#1e1e1e] transition-all duration-500",
            isZenMode ? "fixed inset-0 z-50" : "p-8 max-w-[95%] mx-auto"
        )}>
            {/* Header / Window Bar */}
            <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/10 bg-[#252526]">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2 group">
                        {/* Close Button - Go Back */}
                        <div
                            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                            onClick={() => router.back()}
                            title="Close (Go Back)"
                        >
                            <XCircle className="w-2 h-2 fill-black/50" />
                        </div>
                        {/* Minimize Button - Exit Zen Mode */}
                        <div
                            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                            onClick={() => setIsZenMode(false)}
                            title="Minimize (Exit Fullscreen)"
                        >
                            <Minimize2 className="w-2 h-2 fill-black/50" />
                        </div>
                        {/* Maximize Button - Toggle Zen Mode */}
                        <div
                            className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                            onClick={() => setIsZenMode(!isZenMode)}
                            title="Toggle Fullscreen"
                        >
                            {isZenMode ? <Minimize2 className="w-2 h-2 fill-black/50" /> : <Maximize2 className="w-2 h-2 fill-black/50" />}
                        </div>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                            <FileCode2 className="h-3.5 w-3.5" />
                            {result.repo_name}
                        </span>
                        <span className="text-zinc-600 text-xs">/</span>
                        <span className="text-xs text-zinc-300 font-medium">#{result.pr_number} {result.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-2 py-1 rounded bg-white/5">
                        Read-Only Diff
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                        onClick={() => setIsZenMode(!isZenMode)}
                    >
                        {isZenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 w-full min-h-0 relative bg-[#1e1e1e]">
                <Editor
                    height="100%"
                    defaultLanguage="diff"
                    theme="vs-dark"
                    value={result.diff}
                    options={{
                        readOnly: true,
                        minimap: {
                            enabled: true,
                            scale: 1,
                            renderCharacters: true,
                            maxColumn: 120
                        },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
                        fontLigatures: true,
                        lineHeight: 24,
                        padding: { top: 20 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        renderLineHighlight: "all",
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                />
            </div>
        </div>
    )
}
