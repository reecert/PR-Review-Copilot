
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, GitPullRequest, Calendar, User, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/LoadingScreen";

interface PRSummary {
    number: number;
    title: string;
    user: string;
    updated_at: string;
    url: string;
}

export default function RepoPage() {
    const searchParams = useSearchParams();
    const repoUrl = searchParams.get("url");
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prs, setPrs] = useState<PRSummary[]>([]);

    useEffect(() => {
        if (!repoUrl) return;

        const fetchPrs = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/repo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: repoUrl }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to fetch PRs");
                }

                const data = await res.json();
                setPrs(data.prs);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrs();
    }, [repoUrl]);

    if (!repoUrl) return <div className="text-white p-10">No Repo URL provided.</div>;

    if (loading) {
        return (
            <LoadingScreen
                title="Fetching Open PRs"
                subtitle="Scanning repository for active pull requests..."
            />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg max-w-md text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-200 mb-2">Failed to load PRs</h2>
                    <p className="text-red-300 mb-4">{error}</p>
                    <a href="/" className="text-sm text-red-400 hover:text-red-300 underline">Try another URL</a>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto p-6">
                <header className="mb-10 pt-10">
                    <button
                        onClick={() => router.push("/")}
                        className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <div className="p-1 rounded-md bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                            <ArrowRight className="w-3 h-3 rotate-180" />
                        </div>
                        Back to Search
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                            <GitPullRequest className="w-6 h-6 text-purple-300" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Open Pull Requests</h1>
                    </div>
                    <p className="text-gray-400 font-mono text-sm pl-1">{repoUrl}</p>
                </header>

                <main className="space-y-4">
                    {prs.length === 0 ? (
                        <div className="text-center py-20 px-6 rounded-3xl bg-white/5 border border-white/10 border-dashed backdrop-blur-sm">
                            <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                                <GitPullRequest className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No Open Pull Requests</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">This repository doesn't have any open pull requests right now.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {prs.map((pr, i) => (
                                <div
                                    key={pr.number}
                                    onClick={() => router.push(`/review?pr=${encodeURIComponent(pr.url)}`)}
                                    className="group relative bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-5 hover:bg-white/[0.03] hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                    #{pr.number}
                                                </span>
                                                <h3 className="text-lg font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                                                    {pr.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    {pr.user}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(pr.updated_at).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-gray-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all">
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
