"use client"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react"

export default function SettingsPage() {
    const { user } = useAuth()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState("")

    if (!user) return <div className="p-10">Loading profile...</div>

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                localStorage.removeItem("token")
                localStorage.removeItem("user_cache")
                window.location.href = "/"
            } else {
                alert("Failed to delete account. Please try again.")
                setIsDeleting(false)
                setShowConfirm(false)
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred.")
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    return (
        <div className="space-y-6 p-10 pb-16 block relative min-h-screen">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and set e-mail preferences.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 lg:max-w-2xl grid gap-10">
                    <Card className="border-border/40 bg-zinc-900/20 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                This is how others will see you on the site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={user.full_name || ""} disabled className="bg-zinc-950/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email} disabled className="bg-zinc-950/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Tell us about yourself"
                                    defaultValue={user.bio || ""}
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Brief description for your profile. URLs are hyperlinked.
                                </p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button>Save changes</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/10 bg-red-500/5 transition-colors hover:border-red-500/20 group">
                        <CardHeader>
                            <CardTitle className="text-red-400">Danger Zone</CardTitle>
                            <CardDescription className="text-red-400/70">
                                Irreversible actions for your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-background/50 backdrop-blur-sm transition-all duration-300 group-hover:bg-red-500/10">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-foreground">Delete Account</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently remove your account and all data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 active:scale-95 cursor-pointer relative overflow-hidden"
                                    onClick={() => setShowConfirm(true)}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirm(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            className="relative w-full max-w-md overflow-hidden rounded-xl border border-red-900/50 bg-zinc-950 shadow-2xl shadow-red-900/20 z-10"
                        >
                            <div className="relative p-6">
                                <div className="absolute right-4 top-4">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="mb-6 flex items-center justify-center">
                                    <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20 relative">
                                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-20 duration-1000" />
                                        <AlertTriangle className="h-8 w-8 text-red-500 relative z-10" />
                                    </div>
                                </div>
                                <div className="mb-6 text-center space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">Delete Account?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed px-4">
                                        This action is <span className="text-red-400 font-medium">irreversible</span>. All your repositories, analyses, and data will be permanently wiped from our servers.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-3 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                                        <Label className="text-xs text-muted-foreground flex justify-between">
                                            <span>Confirmation</span>
                                            <span className="font-mono text-[10px] opacity-50 uppercase">Required</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                placeholder="Type delete to confirm"
                                                className="border-zinc-800 bg-black/40 text-center font-mono focus-visible:ring-red-500/30 pl-3 pr-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowConfirm(false)}
                                            className="hover:bg-zinc-900 border-zinc-800 h-11"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            disabled={confirmText !== "delete" || isDeleting}
                                            onClick={handleDeleteAccount}
                                            className="bg-red-600 hover:bg-red-700 gap-2 h-11 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:grayscale"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4" />
                                                    Confirm
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-20" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
