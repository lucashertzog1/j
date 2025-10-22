
'use server';

/**
 * @fileOverview A flow for evaluating a user's translation of a given text.
 *
 * - evaluateTranslation - A function that compares a user's translation against a reference.
 * - EvaluateTranslationInput - The input type for the function.
 * - EvaluateTranslationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { EvaluateTranslationInputSchema, EvaluateTranslationOutputSchema, type EvaluateTranslationInput, type EvaluateTranslationOutput } from '@/ai/schemas/translation-schema';

export async function evaluateTranslation(input: EvaluateTranslationInput): Promise<EvaluateTranslationOutput> {
  return evaluateTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateTranslationPrompt',
  input: { schema: EvaluateTranslationInputSchema },
  output: { schema: EvaluateTranslationOutputSchema },
  prompt: `You are an expert English-Portuguese language teacher for children. Your task is to evaluate a user's translation of a text.

Analyze the user's translation by comparing it to the reference translation, in the context of the original English text.

Your evaluation should be encouraging and pedagogical.

1.  **Accuracy Score**: Provide a score from 0 to 100. 100 means a perfect or near-perfect translation. Minor grammatical mistakes or different valid word choices should not heavily penalize the score. The score should reflect semantic and grammatical correctness.
2.  **Feedback**: Provide constructive feedback in simple Brazilian Portuguese. Start with a positive comment. Then, gently point out any significant errors (not just minor stylistic differences) and suggest better alternatives. Keep the feedback concise (2-3 sentences).

---
**Original English Text:**
"{{originalText}}"

**Reference Portuguese Translation:**
"{{referenceTranslation}}"

**User's Portuguese Translation:**
"{{userTranslation}}"

---
Your output must be a valid JSON object with "accuracy" and "feedback" fields.

Example Feedback: "Ótimo trabalho! Sua tradução capturou bem a ideia principal. Apenas uma dica: a frase 'ele foi para a loja' poderia soar um pouco mais natural como 'ele foi à loja'. Continue assim! 👍"
`,
});

const evaluateTranslationFlow = ai.defineFlow(
  {
    name: 'evaluateTranslationFlow',
    inputSchema: EvaluateTranslationInputSchema,
    outputSchema: EvaluateTranslationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("AI failed to evaluate the translation.");
    }
    
    // Ensure the accuracy is a whole number.
    output.accuracy = Math.round(output.accuracy);

    return output;
  }
);
