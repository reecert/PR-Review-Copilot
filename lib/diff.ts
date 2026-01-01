
export interface DiffLine {
    type: 'add' | 'del' | 'ctx';
    content: string;
    newLineNumber: number | null; // Null for deleted lines
    oldLineNumber: number | null; // Null for added lines
    rawIndex: number; // Index in the raw patch string lines
}

export interface ParsedPatch {
    hunks: DiffLine[];
}

/**
 * Parses a Unified Diff string into a flat list of lines with numbering.
 */
export function parsePatch(patch: string): ParsedPatch {
    if (!patch) return { hunks: [] };

    const lines = patch.split('\n');
    const result: DiffLine[] = [];

    let currentOld = 0;
    let currentNew = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for hunk header
        // @@ -oldStart,oldCount +newStart,newCount @@
        const headerMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (headerMatch) {
            currentOld = parseInt(headerMatch[1], 10);
            currentNew = parseInt(headerMatch[3], 10);
            continue;
        }

        if (line.startsWith('+++') || line.startsWith('---') || line === '\\ No newline at end of file') {
            continue;
        }

        const firstChar = line[0];
        const content = line.substring(1) || ''; // Handle empty lines if any (diffs usually have space)

        if (firstChar === ' ') {
            // Context
            result.push({
                type: 'ctx',
                content,
                newLineNumber: currentNew,
                oldLineNumber: currentOld,
                rawIndex: i
            });
            currentNew++;
            currentOld++;
        } else if (firstChar === '+') {
            // Add
            result.push({
                type: 'add',
                content,
                newLineNumber: currentNew,
                oldLineNumber: null,
                rawIndex: i
            });
            currentNew++;
        } else if (firstChar === '-') {
            // Delete
            result.push({
                type: 'del',
                content,
                newLineNumber: null,
                oldLineNumber: currentOld,
                rawIndex: i
            });
            currentOld++;
        }
    }

    return { hunks: result };
}

/**
 * Generates a code snippet for a given range of NEW line numbers.
 * The range is inclusive.
 * Citations are strictly for NEW files.
 */
export function getSnippetByRange(mappedPatch: ParsedPatch, startLine: number, endLine: number): string | null {
    const matchingLines = mappedPatch.hunks.filter(l =>
        l.newLineNumber !== null && l.newLineNumber >= startLine && l.newLineNumber <= endLine
    );

    if (matchingLines.length === 0) return null;

    // We should also include some context if possible, but simplest is just the range.
    // The requirement says "return snippet".
    return matchingLines.map(l => l.content).join('\n');
}

/**
 * Helper to build line map - mostly covered by parsePatch return type.
 * But we want a map that maps newLineNumber -> raw Content/Type for quick lookup.
 */
export function buildLineMap(patch: string) {
    return parsePatch(patch).hunks;
}
