"use client"

import { motion } from "framer-motion"

export function FluidLoader() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black gap-8">
            <div className="relative h-32 w-32">
                {/* Organic Blobs */}
                <motion.div
                    className="absolute inset-0 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-50"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute inset-0 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-50"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-10"
                >
                    <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
                <motion.h3
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Analyzing Codebase
                </motion.h3>
                <motion.p
                    className="text-zinc-400 text-sm max-w-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Our AI is traversing the dependency graph and evaluating complexity...
                </motion.p>

                {/* Progress Bar with Particles */}
                <div className="w-64 h-1.5 bg-zinc-900 rounded-full mt-4 overflow-hidden relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    )
}
