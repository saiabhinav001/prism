"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    GitPullRequest,
    GitMerge,
    Calendar,
    User,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    FileCode2,
    Code2
} from "lucide-react"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { API_URL } from "@/lib/api-config"
import Link from "next/link"

interface PullRequest {
    id: number
    number: number
    title: string
    user: {
        login: string
        avatar_url: string
    }
    html_url: string
    state: string
    created_at: string
    updated_at: string
    repo_name: string
    internal_repo_id: number
    latest_analysis_id?: number
    latest_analysis_status?: string
}

export default function PullRequestsPage() {
    const [prs, setPrs] = useState<PullRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState<number | null>(null)
    const router = useRouter()

    const handleAnalyze = async (pr: PullRequest) => {
        setAnalyzing(pr.id)
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const res = await fetch("/api/v1/analysis/trigger-live", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    repo_id: pr.internal_repo_id,
                    pr_number: pr.number,
                    title: pr.title,
                    html_url: pr.html_url,
                    author: pr.user.login
                })
            })

            if (res.ok) {
                const data = await res.json()
                router.push(`/dashboard/analysis/${data.analysis_id}`)
            } else {
                const errorText = await res.text()
                console.error(`Analysis trigger failed: ${res.status} ${errorText}`)
                console.log("Payload sent:", { repo_id: pr.internal_repo_id, pr_number: pr.number })
            }
        } catch (error) {
            console.error("Failed to trigger analysis", error)
        } finally {
            setAnalyzing(null)
        }
    }

    const fetchPullRequests = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const res = await fetch(`${API_URL}/api/v1/repos/pulls`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setPrs(data)
            } else {
                setError("Failed to load pull requests.")
            }
        } catch (error) {
            console.error("Failed to fetch PRs", error)
            setError("Could not connect to server.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPullRequests()
    }, [])

    if (loading && prs.length === 0) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-10 pb-16">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                        Pull Requests
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Review and analyze open pull requests from your active repositories.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                        onClick={fetchPullRequests}
                        disabled={loading}
                    >
                        <Icons.refresh className={cn("h-4 w-4", loading && "animate-spin")} />
                        Refresh List
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-red-500/20 rounded-2xl bg-red-500/5 backdrop-blur-md space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            ) : prs.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-zinc-800/60 rounded-3xl bg-zinc-900/20 backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative p-6 bg-zinc-900/80 rounded-full ring-1 ring-white/10 shadow-2xl">
                            <GitPullRequest className="h-12 w-12 text-zinc-400" />
                        </div>
                    </div>
                    <div className="text-center space-y-2 max-w-md">
                        <h3 className="text-xl font-medium tracking-tight text-foreground">No Open Pull Requests</h3>
                        <p className="text-sm text-muted-foreground">
                            There are no open pull requests in your active repositories.
                            Check back later or create a new pull request on GitHub.
                        </p>
                    </div>
                    <Link href="/dashboard/repositories">
                        <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                            Manage Repositories
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {prs.map((pr, index) => (
                        <div
                            key={pr.id}
                            className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/0 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
                            <Card className="relative overflow-hidden bg-zinc-900/40 border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-900/60 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="flex gap-5">
                                            <div className="mt-1">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 ring-1 ring-green-500/20 text-green-500 shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform duration-500">
                                                    <GitMerge className="h-6 w-6" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-xs font-medium text-zinc-400">
                                                        <Icons.repositories className="h-3.5 w-3.5" />
                                                        {pr.repo_name}
                                                    </div>
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 ring-1 ring-green-500/20 text-xs font-medium text-green-400">
                                                        <GitPullRequest className="h-3 w-3" />
                                                        #{pr.number}
                                                    </div>
                                                    <span className="text-xs text-zinc-500 hidden sm:inline-block">
                                                        {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors">
                                                        {pr.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                                                        <div className="flex items-center gap-2 group/author">
                                                            <div className="relative">
                                                                <img
                                                                    src={pr.user.avatar_url}
                                                                    alt={pr.user.login}
                                                                    className="h-5 w-5 rounded-full ring-1 ring-white/20 transition-transform group-hover/author:scale-110"
                                                                />
                                                                <div className="absolute inset-0 rounded-full ring-1 ring-white/0 group-hover/author:ring-white/20 transition-all" />
                                                            </div>
                                                            <span className="group-hover/author:text-zinc-300 transition-colors">{pr.user.login}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>Modified {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3 md:pl-8 md:border-l md:border-white/5">
                                            <Button variant="ghost" className="w-full sm:w-auto h-11 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" asChild>
                                                <a href={pr.html_url} target="_blank" rel="noreferrer" className="gap-2">
                                                    <Icons.gitHub className="h-4 w-4" />
                                                    GitHub
                                                </a>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="w-full sm:w-auto h-11 px-6 gap-2 rounded-xl font-medium border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all items-center"
                                                asChild
                                            >
                                                <Link href={`/dashboard/diff/${pr.internal_repo_id}/${pr.number}`}>
                                                    <Code2 className="h-4 w-4" />
                                                    View Code
                                                </Link>
                                            </Button>

                                            {pr.latest_analysis_id && pr.latest_analysis_status !== 'failed' ? (
                                                <Button
                                                    onClick={() => router.push(`/dashboard/analysis/${pr.latest_analysis_id}`)}
                                                    className="w-full sm:w-auto h-11 px-8 gap-2.5 rounded-xl font-medium shadow-xl shadow-black/20 transition-all duration-300 bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 hover:shadow-emerald-500/20"
                                                >
                                                    {pr.latest_analysis_status === 'processing' || pr.latest_analysis_status === 'pending' ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileCode2 className="h-4 w-4" />
                                                            View Results
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleAnalyze(pr)}
                                                    disabled={analyzing === pr.id}
                                                    className={cn(
                                                        "w-full sm:w-auto h-11 px-8 gap-2.5 rounded-xl font-medium shadow-xl shadow-black/20 transition-all duration-300",
                                                        analyzing === pr.id
                                                            ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                                            : "bg-white text-black hover:bg-zinc-200 hover:scale-105 hover:shadow-white/10"
                                                    )}
                                                >
                                                    {analyzing === pr.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Analyzing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileCode2 className="h-4 w-4" />
                                                            Analyze PR
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
