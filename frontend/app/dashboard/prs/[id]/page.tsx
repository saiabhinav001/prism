"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { DiffViewer } from "@/components/diff-viewer"

import { PageTransition } from "@/components/animations"

export default function PRDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>({
        pr: { title: "Refactor Authentication Logic", number: 42, author: "shadcn" },
        analysis: {
            merge_confidence_score: 85,
            security_score: 95,
            performance_score: 88,
            readability_score: 90,
            issues: [
                { type: "quality", description: "Missing error handling in commit logic.", severity: "medium", file: "service.py", line: 42 },
                { type: "security", description: "Potential unhandled token expiry.", severity: "low", file: "auth.py", line: 120 },
            ]
        }
    })

    if (!data) return <div className="p-8 text-zinc-400">Loading analysis...</div>

    return (
        <PageTransition>
            <div className="flex flex-col h-full space-y-8 p-8">
                <div className="flex justify-between items-center backdrop-blur-md bg-zinc-900/30 p-4 rounded-xl border border-white/5 sticky top-0 z-30">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            #{data.pr.number} {data.pr.title}
                        </h1>
                        <p className="text-zinc-500">Authored by <span className="text-zinc-300">{data.pr.author}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-zinc-700 bg-transparent hover:bg-zinc-800">View on GitHub</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">Merge PR</Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                        <CardHeader><CardTitle className="text-zinc-400">Merge Confidence</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-emerald-400 drop-shadow-sm">{data.analysis.merge_confidence_score}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                        <CardHeader><CardTitle className="text-zinc-400">Security</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-white">{data.analysis.security_score}/100</div>
                            <Progress value={data.analysis.security_score} className="mt-2 h-1 bg-zinc-800" indicatorClassName="bg-blue-500" />
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                        <CardHeader><CardTitle className="text-zinc-400">Performance</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-white">{data.analysis.performance_score}/100</div>
                            <Progress value={data.analysis.performance_score} className="mt-2 h-1 bg-zinc-800" indicatorClassName="bg-purple-500" />
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                        <CardHeader><CardTitle className="text-zinc-400">Readability</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-white">{data.analysis.readability_score}/100</div>
                            <Progress value={data.analysis.readability_score} className="mt-2 h-1 bg-zinc-800" indicatorClassName="bg-orange-500" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-sm">
                        <CardHeader><CardTitle>Code Changes</CardTitle></CardHeader>
                        <CardContent>
                            <DiffViewer
                                original="// Old Code\ndef process():\n    print('hello')"
                                modified="// New Code\ndef process():\n    try:\n        print('hello')\n    except:\n        pass"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-4">
                        <h2 className="text-xl font-bold">Issues Detected</h2>
                        {data.analysis.issues.map((issue: any, i: number) => (
                            <Card key={i} className="bg-zinc-900/40 border-l-4 border-l-orange-500 border-white/5 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex justify-between text-base">
                                        <span className="font-mono text-zinc-300">{issue.file} (Line {issue.line})</span>
                                        <Badge variant={issue.severity === "high" ? "destructive" : "default"}>{issue.severity}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400">{issue.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="col-span-1">
                        <Card className="h-full bg-zinc-900/60 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                            <CardHeader><CardTitle className="text-indigo-400">AI Summary</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 leading-relaxed">The PR is well structured but lacks error handling in critical database sections. Recommended to address the try/except block before merging.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
