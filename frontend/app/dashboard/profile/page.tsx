"use client"

import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Metadata removed to fix "use client" conflict

import { useAuth } from "@/components/auth-provider"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return <div>Loading...</div>

    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                    View and manage your public profile.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <div className="flex-1 lg:max-w-3xl">
                    <Card className="border-border/40 bg-zinc-900/20 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        <CardHeader className="flex flex-row items-center gap-8 pb-8 relative z-10">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity" />
                                <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                                    <AvatarImage src={user.avatar_url || "/avatars/01.png"} alt={user.full_name || "User"} />
                                    <AvatarFallback className="text-4xl bg-zinc-900 text-zinc-400">{user.full_name ? user.full_name.charAt(0) : "U"}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-1.5 pt-4">
                                <CardTitle className="text-3xl font-bold tracking-tight">{user.full_name || "User"}</CardTitle>
                                <CardDescription className="text-base">{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="grid gap-6 p-1">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">About</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                        {user.bio || "No bio provided yet. Add a bio in settings to personalize your profile."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
