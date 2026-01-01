
import { Octokit } from "octokit";

// Initialize Octokit with the provided token from environment variables
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface PRMetadata {
    owner: string;
    repo: string;
    number: number;
    title: string;
    body: string;
    author: string;
    state: string;
    labels: string[];
}

export interface PRFile {
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    patch?: string; // Unified diff
    sha: string;
    raw_url: string;
}

export async function fetchPRMetadata(owner: string, repo: string, number: number): Promise<PRMetadata> {
    const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: number,
    });

    return {
        owner,
        repo,
        number,
        title: data.title,
        body: data.body || "",
        author: data.user.login,
        state: data.state,
        labels: data.labels.map((l: any) => l.name),
    };
}

export async function fetchPRFiles(owner: string, repo: string, number: number): Promise<PRFile[]> {
    const files: PRFile[] = [];

    // Pagination
    for await (const response of octokit.paginate.iterator(octokit.rest.pulls.listFiles, {
        owner,
        repo,
        pull_number: number,
        per_page: 100,
    })) {
        for (const file of response.data) {
            files.push({
                filename: file.filename,
                status: file.status as PRFile["status"],
                additions: file.additions,
                deletions: file.deletions,
                patch: file.patch,
                sha: file.sha,
                raw_url: file.raw_url,
            });
        }
    }

    return files;
}

/**
 * Fallback to fetch file content and generate a simple diff if patch is missing.
 * This happens for large files.
 * Ideally, we would fetch base and head and diff them.
 * For now, if we can't get the patch, we might just return the new content or a placeholder.
 * 
 * NOTE: Generating a true unified diff manually is complex.
 * The prompt requires: "Fall back: fetch base + head file contents via GitHub contents API and run a simple line diff on the server"
 */
export async function fetchFileContent(owner: string, repo: string, path: string, ref: string): Promise<string | null> {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref,
            mediaType: {
                format: "raw",
            },
        });

        // Data is string if mediaType format is raw and it's a file
        return data as unknown as string;
    } catch (e) {
        console.error(`Failed to fetch content for ${path} at ${ref}`, e);
        return null; // Binary or other error
    }
}
