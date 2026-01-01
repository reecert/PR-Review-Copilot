
import { NextRequest, NextResponse } from "next/server";
import { fetchPRFiles, fetchPRMetadata, PRFile } from "@/lib/github";
import { analyzePR, PRContext } from "@/lib/llm";

export const maxDuration = 60; // Allow 60 seconds for LLM logic if platform supports

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        // specific regex for github pull request url
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!match) {
            return NextResponse.json({ error: "Invalid GitHub PR URL" }, { status: 400 });
        }

        const [_, owner, repo, numberStr] = match;
        const number = parseInt(numberStr, 10);

        // 1. Fetch Metadata
        const prData = await fetchPRMetadata(owner, repo, number);

        // 2. Fetch Files
        const filesData = await fetchPRFiles(owner, repo, number);

        // 3. Prepare Context for LLM
        // Limit payload size if necessary. For now we assume typical PR size fits in GPT-4 context (128k).
        // We should filter out deleted files or binary files from text analysis maybe?
        // But deletions are relevant.

        // We want to pass the raw patch so the LLM can see line numbers.
        const filesForContext = filesData.map((f: PRFile) => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch || "[No patch available - binary or too large]"
        }));

        const context: PRContext = {
            pr: {
                title: prData.title,
                body: prData.body,
                author: prData.author,
            },
            files: filesForContext
        };

        // 4. Call LLM
        const apiKey = process.env.LLM_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Server misconfigured: Missing LLM_API_KEY" }, { status: 500 });
        }

        const review = await analyzePR(context, apiKey);

        // 5. Return Result along with raw file data so UI can start its own parsing for snippets
        // We need to return the patch data to the UI so it can reconstruct the snippets when the user clicks "Show evidence"
        // The UI needs: Review JSON + Map of Filename -> Patch (to run parsePatch and getSnippetByRange)

        return NextResponse.json({
            review,
            pr: prData,
            files: filesData // Sent to client for local parsing of snippets
        });

    } catch (error: any) {
        console.error("Review failed:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
