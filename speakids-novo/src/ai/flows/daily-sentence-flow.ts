
'use server';

/**
 * @fileOverview A flow for generating a daily sentence for the Sentence Scramble game.
 *
 * - getDailySentence - A function that returns a sentence based on a CEFR level.
 * - DailySentenceInput - The input type for the getDailySentence function.
 * - DailySentenceOutput - The return type for the getDailySentence function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DailySentenceInputSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).describe("The CEFR level for the sentence."),
  cacheBuster: z.string().optional().describe("A random string to bypass cache."),
});
export type DailySentenceInput = z.infer<typeof DailySentenceInputSchema>;

const DailySentenceOutputSchema = z.object({
  sentence: z.string().describe("A grammatically correct English sentence appropriate for the specified CEFR level."),
});
export type DailySentenceOutput = z.infer<typeof DailySentenceOutputSchema>;

export async function getDailySentence(input: DailySentenceInput): Promise<DailySentenceOutput> {
  return dailySentenceFlow(input);
}

// We use the date to ensure the same sentence is generated for everyone each day.
const prompt = ai.definePrompt({
  name: 'dailySentencePrompt',
  input: { schema: DailySentenceInputSchema },
  output: { schema: DailySentenceOutputSchema },
  prompt: `Gere uma frase em inglês simples e gramaticalmente correta, apropriada para um aprendiz de línguas no nível CEFR {{level}}.
A frase deve conter entre 5 e 10 palavras.
Não use vocabulário excessivamente complexo ou gírias.
Ignore este valor para evitar o cache: {{cacheBuster}}`,
});

const dailySentenceFlow = ai.defineFlow(
  {
    name: 'dailySentenceFlow',
    inputSchema: DailySentenceInputSchema,
    outputSchema: DailySentenceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
