
'use server';

/**
 * @fileOverview A flow for generating a word for the Word Panda game.
 *
 * - getDailyWord - A function that returns a 5-letter word and a hint for it.
 * - DailyWordOutput - The return type for the getDailyWord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DailyWordInputSchema = z.object({
  cacheBuster: z.string().optional().describe("A random string to bypass cache."),
});

const DailyWordOutputSchema = z.object({
  word: z.string().length(5, "A palavra deve ter exatamente 5 letras.").describe("Uma palavra comum em inglês de 5 letras."),
  hint: z.string().describe("Uma dica curta e simples para a palavra."),
});
export type DailyWordOutput = z.infer<typeof DailyWordOutputSchema>;

export async function getDailyWord(input: z.infer<typeof DailyWordInputSchema>): Promise<DailyWordOutput> {
  return dailyWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyWordPrompt',
  input: { schema: DailyWordInputSchema },
  output: { schema: DailyWordOutputSchema },
  prompt: `Gere uma palavra comum em inglês de 5 letras, adequada para um aprendiz de idiomas.
A palavra deve ter exatamente 5 letras. Não gere palavras com letras repetidas como 'hello' ou 'bookk'.
Forneça também uma dica simples de uma frase para a palavra.
Não use nomes próprios.
Ignore este valor para evitar cache: {{cacheBuster}}`,
});

const dailyWordFlow = ai.defineFlow(
  {
    name: 'dailyWordFlow',
    inputSchema: DailyWordInputSchema,
    outputSchema: DailyWordOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
