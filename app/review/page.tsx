
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle, Bug, Shield, FileText, Anchor } from "lucide-react";
import { EvidenceBlock } from "@/components/EvidenceBlock";
import { LoadingScreen } from "@/components/LoadingScreen";
import { cn } from "@/lib/utils";

// Define response types
interface PRFile {
    filename: string;
    status: string;
    patch?: string;
}

interface ReviewData {
    summary: {
        overview: string;
        key_changes: { point: string; citations: string[] }[];
    };
    risk_ranked_files: { file: string; risk: "high" | "med" | "low"; why: string; citations: string[] }[];
    tests: { type: string; suggestion: string; citations: string[] }[];
    code_smells: { issue: string; impact: string; citations: string[] }[];
    security_notes: { issue: string; severity: string; recommendation: string; citations: string[] }[];
}

export default function ReviewPage() {
    const searchParams = useSearchParams();
    const prUrl = searchParams.get("pr");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState<{ review: ReviewData; files: PRFile[], pr: any } | null>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "risks" | "tests" | "smells" | "security">("summary");

    useEffect(() => {
        if (!prUrl) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Step 1: Analyze
                // We could decode URL if needed but we send it raw to API too
                const decodedUrl = decodeURIComponent(prUrl);

                const res = await fetch("/api/review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: decodedUrl }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to analyze PR");
                }

                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [prUrl]);

    if (!prUrl) return <div className="text-white p-10">No PR URL provided.</div>;

    if (loading) {
        return (
            <LoadingScreen
                title="Analyzing Pull Request"
                subtitle="Our AI is reading through the changes..."
                steps={[
                    "Fetching repository files...",
                    "Parsing diffs and patches...",
                    "Analyzing logic for bugs...",
                    "Checking for security vulnerabilities...",
                    "Generating final report..."
                ]}
            />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg max-w-md text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-200 mb-2">Analysis Failed</h2>
                    <p className="text-red-300 mb-4">{error}</p>
                    <a href="/" className="text-sm text-red-400 hover:text-red-300 underline">Try another PR</a>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { review, files, pr } = data;

    const tabs = [
        { id: "summary", label: "Summary", icon: FileText },
        { id: "risks", label: "Risks", icon: AlertTriangle },
        { id: "tests", label: "Tests", icon: CheckCircle },
        { id: "smells", label: "Code Smells", icon: Bug },
        { id: "security", label: "Security", icon: Shield },
    ] as const;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Anchor className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white truncate max-w-md">{pr.title}</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-mono">#{pr.number}</span>
                                <span>•</span>
                                <span>{pr.owner}/{pr.repo}</span>
                                <span>•</span>
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-bold",
                                    pr.state === 'open' ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"
                                )}>{pr.state}</span>
                            </div>
                        </div>
                    </div>
                    <a href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        New Review
                    </a>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="max-w-6xl mx-auto px-6 mt-8 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Area */}
            <main className="max-w-6xl mx-auto px-6 pb-20">

                {/* Summary Tab */}
                {activeTab === "summary" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
                            <p className="text-gray-300 leading-relaxed">{review.summary.overview}</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 px-1">Key Changes</h3>
                            {review.summary.key_changes.map((item, i) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-gray-300">{item.point}</p>
                                            <EvidenceBlock citations={item.citations} files={files} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Risk Tab */}
                {activeTab === "risks" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {review.risk_ranked_files.map((item, i) => (
                            <div key={i} className={cn("bg-gray-900 border rounded-xl p-6 hover:shadow-lg transition-all",
                                item.risk === 'high' ? "border-red-500/30 hover:border-red-500/50" :
                                    item.risk === 'med' ? "border-yellow-500/30 hover:border-yellow-500/50" :
                                        "border-green-500/30 hover:border-green-500/50"
                            )}>
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-mono text-lg text-blue-300">{item.file}</h4>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase",
                                        item.risk === 'high' ? "bg-red-500/20 text-red-400" :
                                            item.risk === 'med' ? "bg-yellow-500/20 text-yellow-400" :
                                                "bg-green-500/20 text-green-400"
                                    )}>{item.risk} Risk</span>
                                </div>
                                <p className="text-gray-300 mb-3">{item.why}</p>
                                <EvidenceBlock citations={item.citations} files={files} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Other tabs follow similar pattern... I will implement generic list renderer for them to be DRY or just list them */}

                {activeTab === "tests" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {review.tests.map((item, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase">{item.type}</span>
                                    <h4 className="font-semibold text-gray-200">Suggestion</h4>
                                </div>
                                <p className="text-gray-300 mb-3">{item.suggestion}</p>
                                <EvidenceBlock citations={item.citations} files={files} />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "smells" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {review.code_smells.length === 0 && <div className="text-center text-gray-500 py-10">No code smells detected. High five! ✋</div>}
                        {review.code_smells.map((item, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-200 mb-1">{item.issue}</h4>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">Impact: <span className="text-gray-300">{item.impact}</span></p>
                                <EvidenceBlock citations={item.citations} files={files} />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {review.security_notes.length === 0 && <div className="text-center text-gray-500 py-10">No security concerns flagged. 🛡️</div>}
                        {review.security_notes.map((item, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500/20 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    <span className={cn("text-xs font-bold uppercase",
                                        item.severity === 'high' ? "text-red-400" :
                                            item.severity === 'med' ? "text-yellow-400" :
                                                "text-blue-400"
                                    )}>{item.severity} Severity</span>
                                </div>
                                <h4 className="font-semibold text-gray-200 mb-2">{item.issue}</h4>
                                <p className="text-sm text-gray-400 mb-4 font-mono bg-gray-950/50 p-2 rounded">Recommendation: {item.recommendation}</p>
                                <EvidenceBlock citations={item.citations} files={files} />
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}
