"use client"

import { DiffEditor } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface DiffViewerProps {
    original: string
    modified: string
}

export function DiffViewer({ original, modified }: DiffViewerProps) {
    const { theme } = useTheme()

    return (
        <div className="h-[500px] border rounded-md overflow-hidden">
            <DiffEditor
                height="100%"
                language="python"
                original={original}
                modified={modified}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    renderSideBySide: true, // Split view
                }}
            />
        </div>
    )
}
