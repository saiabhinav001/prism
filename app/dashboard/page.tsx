"use client"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface DashboardStats {
    total_analyses: number
    avg_merge_confidence: number
    vulnerabilities_caught: number
    active_repos: number
    recent_activity?: Array<{
        id: number
        pr_title: string
        repo_id: number
        score: number
        status: string
        created_at: string
        pr_number: number
    }>
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                // Fetch stats from our new endpoint
                const res = await fetch("/api/v1/analysis/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }

                // Also fetch repo count separately if needed, but the stats endpoint should handle it.
                // For now, we rely on the stats endpoint to return active_repos (even if 0).

            } catch (e) {
                console.error("Failed to fetch stats", e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <PageTransition>
            <div className="flex-1 space-y-6 p-10 pt-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <div className="flex items-center space-x-2">

                    </div>
                </div>

                <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StaggerItem>
                        <Card className="bg-zinc-900/10 border-white/5 hover:border-white/10 hover:bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Analyses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.total_analyses ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Start your first analysis
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                    <StaggerItem>
                        <Card className="bg-zinc-900/10 border-white/5 hover:border-white/10 hover:bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Avg. Merge Confidence
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats?.avg_merge_confidence ?? 0}%`}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    AI Confidence Score
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                    <StaggerItem>
                        <Card className="bg-zinc-900/10 border-white/5 hover:border-white/10 hover:bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Vulnerabilities Caught
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.vulnerabilities_caught ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Critical issues identified
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                    <StaggerItem>
                        <Card className="bg-zinc-900/10 border-white/5 hover:border-white/10 hover:bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 cursor-pointer" onClick={() => window.location.href = '/dashboard/repositories'}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Repos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.active_repos ?? 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Connected repositories
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                </StaggerContainer>

                <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <StaggerItem className="col-span-4">
                        <Card className="bg-zinc-900/10 border-white/5 backdrop-blur-sm h-full">
                            <CardHeader><CardTitle>Analysis History</CardTitle></CardHeader>
                            <CardContent>
                                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recent_activity.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{item.pr_title}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-white">{item.score}/100</div>
                                                    <p className="text-xs text-muted-foreground">Score</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                        No analysis history available.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                    <StaggerItem className="col-span-3">
                        <Card className="bg-zinc-900/10 border-white/5 backdrop-blur-sm h-full">
                            <CardHeader><CardTitle>Recent Pull Requests</CardTitle></CardHeader>
                            <CardContent>
                                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recent_activity.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors" onClick={() => window.location.href = `/dashboard/analysis/${item.id}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-zinc-200">PR #{item.pr_number}</span>
                                                    <span className="text-xs text-zinc-500 truncate max-w-[150px]">{item.pr_title}</span>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-8 text-xs">View Report</Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                                        No recent pull requests analyzed.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </PageTransition>
    )
}
