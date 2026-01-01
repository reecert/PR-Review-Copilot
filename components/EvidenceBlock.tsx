
"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { parsePatch, getSnippetByRange, ParsedPatch } from "@/lib/diff";
import { cn } from "@/lib/utils";
// We import PRFile type, but since it's in lib/github which imports Octokit (server-only usually?)
// We should check provided types for client.
// lib/github.ts imports Octokit -> Node only?
// Actually Octokit can run in browser too usually, but safe to redefine interface or ensure lib/github is safe.
// Let's just define the interface here to be safe and avoid importing server code.
interface PRFile {
    filename: string;
    patch?: string;
}

interface EvidenceBlockProps {
    citations: string[]; // ["path/to/file:L10-L20"]
    files: PRFile[];
}

export function EvidenceBlock({ citations, files }: EvidenceBlockProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Memoize parsing patches to avoid re-parsing on every render
    // In a real app we might pre-parse at the page level.
    const snippets = useMemo(() => {
        return citations.map(citation => {
            // Parse citation: [path:Lstart-Lend]
            const match = citation.match(/\[(.*?):L(\d+)-L(\d+)\]/);
            if (!match) return { citation, error: "Invalid citation format" };

            const [_, path, startStr, endStr] = match;
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            const file = files.find(f => f.filename === path);
            if (!file || !file.patch) return { citation, error: "File or patch unavailable" };

            const parsedPatch = parsePatch(file.patch);
            const snippet = getSnippetByRange(parsedPatch, start, end);

            return { citation, path, start, end, snippet };
        });
    }, [citations, files]);

    if (!citations.length) return null;

    return (
        <div className="mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {isOpen ? "Hide Evidence" : `Show Evidence (${citations.length})`}
            </button>

            {isOpen && (
                <div className="mt-2 space-y-3">
                    {snippets.map((s, idx) => (
                        <div key={idx} className="bg-gray-900 border border-gray-800 rounded-md overflow-hidden text-xs">
                            {s.error ? (
                                <div className="p-2 text-gray-500 italic">{s.citation}: {s.error}</div>
                            ) : (
                                <>
                                    <div className="bg-gray-800/50 px-3 py-1 flex items-center gap-2 border-b border-gray-800">
                                        <FileCode className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-300 font-mono">{s.path}</span>
                                        <span className="text-gray-500">L{s.start}-L{s.end}</span>
                                    </div>
                                    <pre className="p-3 overflow-x-auto text-gray-300 font-mono leading-relaxed">
                                        <code>{s.snippet}</code>
                                    </pre>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
