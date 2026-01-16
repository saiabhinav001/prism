"use client"

import { useAuth } from "@/components/auth-provider"
import { API_URL } from "@/lib/api-config"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, GitFork, Star, Circle, Loader2, Github } from "lucide-react"
import { useEffect, useState } from "react"
import { Icons } from "@/components/icons"

interface Repo {
    name: string
    description: string | null
    language: string | null
    stars: number
    forks: number
    updated_at: string
    private: boolean
    html_url: string
    is_active: boolean
}

export default function RepositoriesPage() {
    const [repositories, setRepositories] = useState<Repo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [toggling, setToggling] = useState<string | null>(null)

    useEffect(() => {
        async function fetchRepos() {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                const res = await fetch(`${API_URL}/api/v1/repos/list`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setRepositories(data)
                } else {
                    setError("Could not fetch repositories. Please connect GitHub.")
                }
            } catch (error) {
                console.error("Failed to fetch repos", error)
                setError("Failed to load repositories.")
            } finally {
                setLoading(false)
            }
        }
        fetchRepos()
    }, [])

    const toggleRepo = async (repo: Repo) => {
        setToggling(repo.html_url)
        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const res = await fetch(`${API_URL}/api/v1/repos/toggle`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(repo)
            })

            if (res.ok) {
                const data = await res.json()
                // Update local state
                setRepositories(repos => repos.map(r =>
                    r.html_url === repo.html_url ? { ...r, is_active: data.is_active } : r
                ))
            }
        } catch (error) {
            console.error("Failed to toggle repo", error)
        } finally {
            setToggling(null)
        }
    }

    const filteredRepos = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleConnectGitHub = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login/github`)
            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error("GitHub connect error:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-10 pb-16">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="space-y-0.5">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Repositories</h2>
                    <p className="text-muted-foreground">
                        Manage your connected repositories.
                    </p>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 transition-colors group-focus-within:text-foreground" />
                    <Input
                        type="search"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-zinc-950/20 border-zinc-800/60 backdrop-blur-sm focus:bg-zinc-950/50 transition-all rounded-full relative"
                    />
                </div>
            </div>

            {filteredRepos.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-zinc-800/60 rounded-xl bg-zinc-950/20 backdrop-blur-sm space-y-4">
                    <div className="p-3 bg-zinc-900/50 rounded-full">
                        <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium">No results found</h3>
                        <p className="text-sm text-muted-foreground">
                            No repositories match "{searchQuery}"
                        </p>
                    </div>
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="h-9">
                        Clear Search
                    </Button>
                </div>
            ) : filteredRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-zinc-800/60 rounded-xl bg-zinc-950/20 backdrop-blur-sm space-y-6">
                    <div className="p-4 bg-zinc-900/50 rounded-full ring-1 ring-white/5">
                        <Icons.gitHub className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-medium tracking-tight">No Repositories Found</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            {error || "Connect your GitHub account to sync your repositories and start analyzing code with PRISM's advanced engine."}
                        </p>
                    </div>
                    <Button onClick={handleConnectGitHub} size="lg" className="h-11 px-8 gap-2 bg-white text-black hover:bg-zinc-200">
                        <Icons.gitHub className="h-5 w-5" />
                        Connect GitHub
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRepos.map((repo) => (
                        <Card
                            key={repo.name}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-zinc-900/40 border-white/5 backdrop-blur-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
                                <div className="space-y-1.5 min-w-0 pr-4">
                                    <CardTitle className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors truncate tracking-tight flex items-center gap-2">
                                        {repo.name}
                                        {repo.private && <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 border-zinc-700 text-zinc-400">Private</Badge>}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {repo.is_active ? (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-medium text-emerald-500">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                                                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                                <span className="text-[10px] font-medium text-zinc-500">Inactive</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant={repo.is_active ? "ghost" : "default"}
                                    className={`
                                        h-8 px-3 text-xs font-medium transition-all duration-300
                                        ${repo.is_active
                                            ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                                            : 'bg-white text-black hover:bg-zinc-200 shadow-sm shadow-white/10'
                                        }
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleRepo(repo)
                                    }}
                                    disabled={toggling === repo.html_url}
                                >
                                    {toggling === repo.html_url ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : repo.is_active ? (
                                        "Disconnect"
                                    ) : (
                                        "Connect"
                                    )}
                                </Button>
                            </CardHeader>

                            <CardContent className="relative z-10 space-y-4">
                                <CardDescription className="line-clamp-2 h-10 text-sm leading-relaxed text-zinc-400/80">
                                    {repo.description || "No description provided."}
                                </CardDescription>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Circle className={`h-2.5 w-2.5 fill-current ${repo.language === 'Python' ? 'text-blue-500' :
                                                repo.language === 'TypeScript' ? 'text-blue-400' :
                                                    repo.language === 'JavaScript' ? 'text-yellow-400' :
                                                        repo.language === 'Rust' ? 'text-orange-500' :
                                                            repo.language === 'Go' ? 'text-cyan-500' :
                                                                repo.language ? 'text-zinc-400' : 'text-zinc-600'
                                                }`} />
                                            <span className="text-zinc-300">{repo.language || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="h-3.5 w-3.5 text-zinc-600 group-hover:text-yellow-500/80 transition-colors" />
                                            <span>{repo.stars}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <GitFork className="h-3.5 w-3.5 text-zinc-600 group-hover:text-blue-500/80 transition-colors" />
                                            <span>{repo.forks}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Icons.gitHub className="h-4 w-4" />
                                        <span className="sr-only">GitHub</span>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    )
}
