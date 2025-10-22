
'use server';

/**
 * @fileOverview A flow for translating text to Portuguese with context, examples, and synonyms.
 *
 * - translate - A function that handles the translation.
 * - TranslateInput - The input type for the translate function.
 * - TranslateOutput - The return type for the translate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateInputSchema = z.object({
  text: z.string().describe('The English word or short phrase to be translated to Portuguese.'),
  context: z.string().describe('The full sentence or context where the text appears.'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.object({
  translation: z.string().describe('The most common Portuguese translation of the word.'),
  explanation: z
    .string()
    .describe(
      'A brief, simple explanation of the word in the given context and a simple example of its use in another sentence. Keep it kid-friendly and concise.'
    ),
  synonyms: z.array(z.string()).describe("A list of 2-3 common English synonyms for the word in the given context."),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translate(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `You are a friendly language teacher for kids.
Translate the English word "{{text}}" to Brazilian Portuguese, considering its use in the following sentence: "{{context}}".

Your response must be in JSON format and include:
1.  "translation": The most common and simple translation for the word.
2.  "explanation": A very short, fun, and easy-to-understand explanation for a child. Explain its meaning in the context of the sentence and then give one simple example of how to use the word in a different sentence. Use an emoji.
3.  "synonyms": An array of 2 or 3 common English synonyms for the word, considering the context.

Example:
Input word: "quick"
Input context: "The quick brown fox jumps over the lazy dog."

Your output should be like this:
{
  "translation": "rápido",
  "explanation": "Aqui, 'quick' significa que a raposa se move velozmente! 🦊 Você pode usar para falar de um lanche, como em: 'Let's have a quick snack.' (Vamos fazer um lanche rápido).",
  "synonyms": ["fast", "swift", "speedy"]
}

---

Input word: {{{text}}}
Input context: {{{context}}}
`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
