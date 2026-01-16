"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FluidLoader } from "@/components/ui/fluid-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Loader2,
    Shield,
    Zap,
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ArrowLeft,
    Share2,
    Download,
    GitPullRequest,
    Copy,
    Twitter,
    Linkedin,
    Slack,
    Check,
    LayoutDashboard,
    Code2,
    FileCode2,
    Maximize2,
    Minimize2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"

interface AnalysisResult {
    id: number
    status: "pending" | "processing" | "completed" | "failed"
    security_score: number
    performance_score: number
    reliability_score: number
    summary: string
    issues: Array<{
        type: "security" | "performance" | "bug" | "style"
        severity: "critical" | "high" | "medium" | "low"
        description: string
        location: string
        suggestion: string
        line?: number
    }>
    created_at: string
    raw_output?: any
    diff_view?: string
}

export default function AnalysisPage() {
    const params = useParams()
    const router = useRouter()
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<"dashboard" | "code">("dashboard")
    const [isZenMode, setIsZenMode] = useState(false)

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    router.push("/login")
                    return
                }

                // Poll for results if status is pending/processing
                const pollInterval = setInterval(async () => {
                    const res = await fetch(`/api/v1/analysis/result/${params.id}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })

                    if (res.ok) {
                        const data = await res.json()
                        setResult(data)

                        if (data.status === "completed" || data.status === "failed") {
                            clearInterval(pollInterval)
                            setLoading(false)
                        }
                    } else {
                        setError("Failed to fetch analysis result")
                        clearInterval(pollInterval)
                        setLoading(false)
                    }
                }, 2000)

                return () => clearInterval(pollInterval)
            } catch (err) {
                console.error(err)
                setError("An error occurred")
                setLoading(false)
            }
        }

        fetchAnalysis()
    }, [params.id, router])

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-500"
        if (score >= 70) return "text-yellow-500"
        return "text-red-500"
    }

    const getScoreBagdeColor = (score: number) => {
        if (score >= 90) return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
        if (score >= 70) return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical": return <XCircle className="h-4 w-4 text-red-500" />
            case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case "low": return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />
        }
    }

    if (error) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-red-500/10 p-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold">Analysis Failed</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        )
    }

    if (result && result.status === "failed") {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-red-500/10 p-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold">Analysis Failed</h3>
                <p className="text-muted-foreground max-w-md text-center">
                    The AI analysis could not be completed. Use the debug view or try again later.
                </p>
                {/* Optional: Show raw error if available in raw_output */}
                {result.raw_output && (
                    <pre className="bg-black/20 p-4 rounded text-xs text-red-300 overflow-auto max-w-lg">
                        {typeof result.raw_output === 'string' ? result.raw_output : JSON.stringify(result.raw_output)}
                    </pre>
                )}
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        )
    }

    if (loading || (result && result.status !== "completed")) {
        return <FluidLoader />
    }

    if (!result) return null

    return (
        <div className="flex flex-col gap-8 mx-auto w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:p-0 transition-all duration-500 max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full print:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Analysis Report</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <GitPullRequest className="h-4 w-4" />
                            Generated on {new Date(result.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto print:hidden">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
                            <DialogHeader>
                                <DialogTitle>Share Analysis Report</DialogTitle>
                                <DialogDescription>
                                    Share this detailed PR analysis with your team.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <Input
                                        id="link"
                                        defaultValue={`https://prism.ai/analysis/${params.id}`}
                                        readOnly
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                                <Button type="submit" size="sm" className="px-3" onClick={() => {
                                    navigator.clipboard.writeText(`https://prism.ai/analysis/${params.id}`)
                                    setCopied(true)
                                    setTimeout(() => setCopied(false), 2000)
                                }}>
                                    <span className="sr-only">Copy</span>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <div className="flex justify-center gap-4 py-4">
                                <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 hover:text-blue-500">
                                    <Twitter className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-blue-700/10 hover:text-blue-700">
                                    <Linkedin className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10 hover:text-purple-500">
                                    <Slack className="h-5 w-5" />
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Custom Premium Tabs */}
            <div className="flex flex-col space-y-6">
                <div className="flex justify-center md:justify-start print:hidden">
                    <div className="flex items-center p-1 bg-zinc-900/80 border border-white/5 rounded-full relative">
                        {["dashboard", "code"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as "dashboard" | "code")}
                                className={cn(
                                    "relative px-6 py-2 text-sm font-medium transition-colors z-10",
                                    activeTab === tab ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-zinc-800 rounded-full border border-white/10 shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20 capitalize flex items-center gap-2">
                                    {tab === "dashboard" ? <LayoutDashboard className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                                    {tab === "code" ? "Code View" : tab}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "dashboard" ? (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                {/* Scores Grid */}
                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden relative group hover:border-white/10 transition-colors duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-zinc-400">Security Score</CardTitle>
                                            <Shield className="h-4 w-4 text-blue-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className={cn("text-4xl font-black tracking-tight", getScoreColor(result.security_score))}>
                                                    {result.security_score}
                                                </span>
                                                <span className="text-sm text-zinc-500 font-medium">/100</span>
                                            </div>
                                            <Progress value={result.security_score} className="h-2 bg-zinc-900/50" />
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden relative group hover:border-white/10 transition-colors duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-zinc-400">Performance Score</CardTitle>
                                            <Zap className="h-4 w-4 text-purple-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className={cn("text-4xl font-black tracking-tight", getScoreColor(result.performance_score))}>
                                                    {result.performance_score}
                                                </span>
                                                <span className="text-sm text-zinc-500 font-medium">/100</span>
                                            </div>
                                            <Progress value={result.performance_score} className="h-2 bg-zinc-900/50" />
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm overflow-hidden relative group hover:border-white/10 transition-colors duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-zinc-400">Reliability Score</CardTitle>
                                            <BookOpen className="h-4 w-4 text-orange-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className={cn("text-4xl font-black tracking-tight", getScoreColor(result.reliability_score))}>
                                                    {result.reliability_score}
                                                </span>
                                                <span className="text-sm text-zinc-500 font-medium">/100</span>
                                            </div>
                                            <Progress value={result.reliability_score} className="h-2 bg-zinc-900/50" />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Summary */}
                                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <LayoutDashboard className="h-5 w-5 text-zinc-400" />
                                            Executive Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="leading-loose text-zinc-300 text-lg selection:bg-white/10">
                                            {result.summary}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Detailed Issues */}
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                                        <AlertTriangle className="h-6 w-6 text-yellow-500/80" />
                                        Detailed Findings
                                    </h2>
                                    <div className="grid gap-4">
                                        {(result.issues || []).map((issue, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors print:break-inside-avoid overflow-hidden group">
                                                    <div className={cn("h-full w-1 absolute left-0 top-0 bottom-0 opacity-80 group-hover:opacity-100 transition-opacity",
                                                        issue.severity === 'critical' ? 'bg-red-500' :
                                                            issue.severity === 'high' ? 'bg-orange-500' :
                                                                'bg-blue-500'
                                                    )} />
                                                    <CardContent className="p-6 pl-8">
                                                        <div className="flex flex-col md:flex-row gap-6">
                                                            <div className="space-y-4 flex-1">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <Badge variant="outline" className={cn("capitalize px-2.5 py-0.5 shadow-sm backdrop-blur-md bg-black/20",
                                                                        issue.severity === 'critical' ? 'border-red-500/30 text-red-500' :
                                                                            issue.severity === 'high' ? 'border-orange-500/30 text-orange-500' :
                                                                                'border-blue-500/30 text-blue-500'
                                                                    )}>
                                                                        {issue.severity}
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="capitalize bg-white/5 text-zinc-300 hover:bg-white/10">{issue.type}</Badge>
                                                                    <span className="text-zinc-500 text-sm font-mono flex items-center gap-1.5 ml-auto md:ml-0 bg-white/5 px-2 py-1 rounded">
                                                                        <FileCode2 className="h-3.5 w-3.5" />
                                                                        {issue.location}
                                                                    </span>
                                                                </div>

                                                                <h4 className="font-semibold text-lg text-zinc-100 leading-snug">
                                                                    {issue.description}
                                                                </h4>

                                                                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 flex gap-4 items-start">
                                                                    <div className="p-1.5 bg-green-500/10 rounded-full shrink-0">
                                                                        <Zap className="h-4 w-4 text-green-400" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-green-500/90 text-xs font-bold uppercase tracking-wider">Recommended Fix</p>
                                                                        <p className="text-green-400/90 text-sm leading-relaxed">
                                                                            {issue.suggestion}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="code"
                                className={cn(
                                    "transition-all duration-500 ease-in-out",
                                    isZenMode ? "fixed inset-0 z-50 p-4 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center" : ""
                                )}
                                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                            >
                                <Card className={cn(
                                    "bg-[#1e1e1e] border-white/10 overflow-hidden shadow-2xl rounded-xl flex flex-col transition-all duration-500",
                                    isZenMode ? "w-[95vw] h-[90vh]" : "w-full min-h-[600px] lg:min-w-[1000px] xl:min-w-full" // Force wider width
                                )}>
                                    <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/10 bg-[#252526]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2 group">
                                                <div
                                                    className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                                                    onClick={() => {
                                                        setIsZenMode(false);
                                                        setActiveTab("dashboard");
                                                    }}
                                                    title="Close"
                                                >
                                                    <XCircle className="w-2 h-2 fill-black/50" />
                                                </div>
                                                <div
                                                    className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                                                    onClick={() => setIsZenMode(false)}
                                                    title="Minimize (Exit Fullscreen)"
                                                >
                                                    <Minimize2 className="w-2 h-2 fill-black/50" />
                                                </div>
                                                <div
                                                    className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 cursor-pointer shadow-inner flex items-center justify-center group-hover:text-black/50 text-transparent transition-colors text-[8px]"
                                                    onClick={() => setIsZenMode(!isZenMode)}
                                                    title="Toggle Fullscreen"
                                                >
                                                    {isZenMode ? <Minimize2 className="w-2 h-2 fill-black/50" /> : <Maximize2 className="w-2 h-2 fill-black/50" />}
                                                </div>
                                            </div>
                                            <div className="h-4 w-[1px] bg-white/10 mx-2" />
                                            <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                                                <FileCode2 className="h-3.5 w-3.5" />
                                                Active Diff Analysis
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Badge variant="outline" className="text-[10px] h-5 border-red-500/20 text-red-500 bg-red-500/10">
                                                    {result.issues?.filter(i => i.severity === 'critical').length || 0} Critical
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] h-5 border-orange-500/20 text-orange-500 bg-orange-500/10">
                                                    {result.issues?.filter(i => i.severity === 'high').length || 0} High
                                                </Badge>
                                            </div>
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
                                    <div className="flex-1 w-full min-h-0 relative flex flex-col">
                                        {(result.diff_view?.includes("Binary files") || result.diff_view?.length === 0) && (
                                            <div className="bg-yellow-500/10 border-b border-yellow-500/10 px-4 py-2 flex items-center gap-2 text-xs text-yellow-400 font-mono">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>This diff contains binary files or is empty. Actual content cannot be displayed.</span>
                                            </div>
                                        )}
                                        <Editor
                                            height="100%"
                                            defaultLanguage="diff"
                                            theme="vs-dark"
                                            value={result.diff_view || "No content to display."}
                                            onMount={(editor, monaco) => {
                                                if (result.issues) {
                                                    const markers: any[] = []
                                                    result.issues.forEach(issue => {
                                                        if (issue.line && issue.line > 0) {
                                                            markers.push({
                                                                startLineNumber: issue.line,
                                                                startColumn: 1,
                                                                endLineNumber: issue.line,
                                                                endColumn: 1000,
                                                                message: `[${issue.severity.toUpperCase()}] ${issue.description}\nSuggested Fix: ${issue.suggestion}`,
                                                                severity: issue.severity === 'critical' ? monaco.MarkerSeverity.Error :
                                                                    issue.severity === 'high' ? monaco.MarkerSeverity.Warning :
                                                                        monaco.MarkerSeverity.Info,
                                                            })
                                                        }
                                                    })
                                                    monaco.editor.setModelMarkers(editor.getModel()!, "owner", markers)
                                                }
                                            }}
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
                                                scrollbar: {
                                                    vertical: 'visible',
                                                    horizontal: 'visible',
                                                    verticalScrollbarSize: 10,
                                                    horizontalScrollbarSize: 10,
                                                    useShadows: true
                                                }
                                            }}
                                        />
                                        {/* Overlay Gradient hint for scroll */}
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none" />
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
