
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, GitPullRequest, Calendar, User, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-gray-400">Fetching open PRs...</p>
            </div>
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
        <div className="min-h-screen bg-gray-950 text-gray-200 p-6 font-sans">
            <header className="max-w-4xl mx-auto mb-8">
                <a href="/" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">&larr; Back to Search</a>
                <h1 className="text-3xl font-bold text-white mb-2">Open Pull Requests</h1>
                <p className="text-gray-400 truncate">{repoUrl}</p>
            </header>

            <main className="max-w-4xl mx-auto space-y-4">
                {prs.length === 0 ? (
                    <div className="text-center py-10 bg-gray-900 rounded-xl border border-gray-800">
                        <p className="text-gray-400">No open pull requests found for this repository.</p>
                    </div>
                ) : (
                    prs.map((pr) => (
                        <div
                            key={pr.number}
                            onClick={() => router.push(`/review?pr=${encodeURIComponent(pr.url)}`)}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors mb-2">
                                        {pr.title} <span className="text-gray-500 text-base font-normal">#{pr.number}</span>
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {pr.user}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(pr.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
