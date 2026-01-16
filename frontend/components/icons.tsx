import {
    Loader2,
    Github,
    Command,
    LayoutDashboard,
    Settings,
    FolderGit2,
    Menu,
    GitPullRequest,
    RotateCw,
} from "lucide-react"

export const Icons = {
    spinner: Loader2,
    gitHub: Github,
    dashboard: LayoutDashboard,
    settings: Settings,
    repositories: FolderGit2,
    pullRequests: GitPullRequest,
    refresh: RotateCw,
    menu: Menu,
    logo: (props: any) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
    ),
}
