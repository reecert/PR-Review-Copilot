export interface ParsedPatch {
    lines: Map<number, string>;
}

export function parsePatch(patch: string): ParsedPatch {
    const lines = new Map<number, string>();
    const splitLines = patch.split('\n');

    let currentNewLine = 0;

    for (const line of splitLines) {
        if (line.startsWith('@@')) {
            // Hunk header: @@ -old,count +new,count @@
            // We only care about the new start line
            const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (match) {
                currentNewLine = parseInt(match[1], 10);
            }
            continue;
        }

        // Skip header lines
        if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('index') || line.startsWith('diff')) {
            continue;
        }

        // Process content lines
        if (line.startsWith('+')) {
            lines.set(currentNewLine, line.substring(1));
            currentNewLine++;
        } else if (line.startsWith(' ')) {
            lines.set(currentNewLine, line.substring(1));
            currentNewLine++;
        } else if (line.startsWith('-')) {
            // Line removed, skip
        }
        // No-newline at end of file, etc. are ignored for now
    }

    return { lines };
}

export function getSnippetByRange(parsed: ParsedPatch, start: number, end: number): string {
    const result: string[] = [];

    for (let i = start; i <= end; i++) {
        const line = parsed.lines.get(i);
        // If the line is not in the patch (context missing), we technically don't have it.
        // We could return a placeholder or just what we have.
        if (line !== undefined) {
            result.push(line);
        }
    }

    return result.join('\n');
}
