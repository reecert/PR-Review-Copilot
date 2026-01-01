
import OpenAI from "openai";
import { ReviewSchema, type Review } from "./schema";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

export interface PRContext {
    pr: {
        title: string;
        body: string;
        author: string;
    };
    files: {
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        patch?: string; // We might truncate this if too long
    }[];
}

export async function analyzePR(
    context: PRContext,
    apiKey: string,
    baseURL?: string,
    model: string = "gpt-4-turbo" // Default to a capable model
): Promise<Review> {
    const openai = new OpenAI({
        apiKey,
        baseURL: baseURL || "https://api.openai.com/v1", // Default if not provided
    });

    const systemPrompt = `You are a strict code review assistant.
You will analyze a GitHub Pull Request and return a JSON review.
You MUST adhere to the following rules:
1. Every claim key point, risk, test suggestion, smell, or security note MUST have at least one valid citation if evidence exists.
2. CITATION FORMAT: [path/to/file:Lstart-Lend]
   - "path/to/file" is the filename.
   - "Lstart" is the line number in the NEW file (post-change).
   - "Lend" is the end line number.
   - Example: [src/utils.ts:L12-L15] or [src/api.ts:L100-L100]
3. Do not cite deleted lines (Use the surrounding context if needed, or omit citation).
4. If a file is too large or binary and patch is missing, do not hallucinate citations.
5. Focus on substantive issues, not just nitpicks.
6. Return ONLY valid JSON matching the schema.
`;

    const userPrompt = JSON.stringify(context, null, 2);

    try {
        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" }, // Enforce JSON mode
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content returned from LLM");

        // Parse and validate
        const parsed = JSON.parse(content);
        const validated = ReviewSchema.parse(parsed);
        return validated;

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn("LLM validation failed, attempting repair...", error.errors);
            // Construct a repair prompt
            const repairPrompt = `The JSON you provided failed validation.
Errors: ${JSON.stringify(error.errors)}
Please fix the JSON and return ONLY the valid JSON matching the schema.
Previous Output: ${error.message} (truncated)`; // simplified for now

            // Retry once
            const retryCompletion = await openai.chat.completions.create({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }, // Repeat user prompt for context
                    { role: "assistant", content: JSON.stringify(error) }, // Simulating the bad output
                    { role: "user", content: repairPrompt }
                ],
                response_format: { type: "json_object" },
            });

            const retryContent = retryCompletion.choices[0].message.content;
            if (!retryContent) throw new Error("No content returned from LLM retry");
            return ReviewSchema.parse(JSON.parse(retryContent));
        }
        throw error;
    }
}
