
import { z } from "zod";

export const CitationSchema = z.string().describe("Citation in [path/to/file:Lstart-Lend] format");

export const SummarySchema = z.object({
    overview: z.string().describe("High-level summary of the PR changes"),
    key_changes: z.array(z.object({
        point: z.string(),
        citations: z.array(CitationSchema).describe("Evidence for this change")
    }))
});

export const RiskRankedFileSchema = z.object({
    file: z.string(),
    risk: z.enum(["high", "med", "low"]),
    why: z.string(),
    citations: z.array(CitationSchema)
});

export const TestSuggestionSchema = z.object({
    type: z.enum(["unit", "integration", "e2e"]),
    suggestion: z.string(),
    citations: z.array(CitationSchema)
});

export const CodeSmellSchema = z.object({
    issue: z.string(),
    impact: z.string(),
    citations: z.array(CitationSchema)
});

export const SecurityNoteSchema = z.object({
    issue: z.string(),
    severity: z.enum(["high", "med", "low"]),
    recommendation: z.string(),
    citations: z.array(CitationSchema)
});

export const ReviewSchema = z.object({
    summary: SummarySchema,
    risk_ranked_files: z.array(RiskRankedFileSchema),
    tests: z.array(TestSuggestionSchema),
    code_smells: z.array(CodeSmellSchema),
    security_notes: z.array(SecurityNoteSchema)
});

export type Review = z.infer<typeof ReviewSchema>;
