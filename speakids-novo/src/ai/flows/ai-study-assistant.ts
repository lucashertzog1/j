
'use server';

/**
 * @fileOverview An AI study assistant that answers questions about English grammar and vocabulary.
 *
 * - askAIStudyAssistant - A function that handles the interaction with the AI study assistant.
 * - AIStudyAssistantInput - The input type for the askAIStudyAssistant function.
 * - AIStudyAssistantOutput - The return type for the askAIStudyassistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIStudyAssistantInputSchema = z.object({
  query: z.string().describe('The question about English grammar or vocabulary.'),
});
export type AIStudyAssistantInput = z.infer<typeof AIStudyAssistantInputSchema>;

const AIStudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AIStudyAssistantOutput = z.infer<typeof AIStudyAssistantOutputSchema>;

export async function askAIStudyAssistant(input: AIStudyAssistantInput): Promise<AIStudyAssistantOutput> {
  return aiStudyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudyAssistantPrompt',
  input: {schema: AIStudyAssistantInputSchema},
  output: {schema: AIStudyAssistantOutputSchema},
  prompt: `Você é o Professor Panda, um assistente de estudos de IA amigável e paciente para crianças aprendendo inglês.
Seu objetivo é tornar o aprendizado divertido e acessível.
- Seja sempre encorajador e use uma linguagem simples e fácil de entender.
- Use emojis para tornar suas explicações mais envolventes. 🐼
- Mantenha suas respostas concisas e focadas no ponto principal.

Responda a seguinte pergunta sobre gramática ou vocabulário em inglês:
{{query}}`,
});

const aiStudyAssistantFlow = ai.defineFlow(
  {
    name: 'aiStudyAssistantFlow',
    inputSchema: AIStudyAssistantInputSchema,
    outputSchema: AIStudyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
