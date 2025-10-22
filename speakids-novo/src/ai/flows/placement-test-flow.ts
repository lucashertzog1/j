
'use server';

/**
 * @fileOverview A flow for evaluating a user's placement test results to determine their CEFR level.
 *
 * - evaluatePlacementTest - A function that takes user answers and determines a CEFR level.
 * - PlacementTestInput - The input type for the evaluation function.
 * - PlacementTestOutput - The return type for the evaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  level: z.string(),
  isCorrect: z.boolean(),
  selectedOption: z.string(),
});

const PlacementTestInputSchema = z.object({
  answers: z.array(AnswerSchema).describe("An array of the user's answers to the placement test questions."),
});
export type PlacementTestInput = z.infer<typeof PlacementTestInputSchema>;

const PlacementTestOutputSchema = z.object({
  finalLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).describe('The calculated final CEFR level for the user.'),
  analysis: z.string().describe("A brief, encouraging analysis of the user's performance, highlighting strengths and areas for improvement."),
});
export type PlacementTestOutput = z.infer<typeof PlacementTestOutputSchema>;

export async function evaluatePlacementTest(input: PlacementTestInput): Promise<PlacementTestOutput> {
  return placementTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'placementTestEvaluationPrompt',
  input: { schema: PlacementTestInputSchema },
  output: { schema: PlacementTestOutputSchema },
  prompt: `Você é uma IA especialista em avaliação de proficiência em inglês. Sua tarefa é analisar os resultados de um teste de nivelamento de um usuário e determinar seu nível CEFR (A1, A2, B1, B2).

Analise o array JSON de respostas fornecido. O desempenho do usuário em diferentes níveis é fundamental.
- Conte o número de respostas corretas para cada nível (A1, A2, B1, B2, etc.).
- O nível final do usuário é o nível mais alto no qual ele respondeu corretamente a pelo menos 60% das perguntas.
- Se o usuário responder corretamente a menos de 60% das perguntas do nível A1, classifique-o como A1.

Com base na análise das respostas do usuário abaixo, determine seu nível CEFR final. Além disso, forneça uma análise curta, positiva e encorajadora (em português simples) de seu desempenho.

Respostas do Usuário:
{{{json answers}}}

Sua saída deve ser um objeto JSON válido com os campos "finalLevel" e "analysis".
Exemplo de análise: "Parabéns! Você tem uma base sólida em vocabulário e gramática. Seu nível é B1. Vamos focar em expandir sua fluidez em conversas mais complexas!"
`,
});

const placementTestFlow = ai.defineFlow(
  {
    name: 'placementTestFlow',
    inputSchema: PlacementTestInputSchema,
    outputSchema: PlacementTestOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error("A resposta da IA foi nula ou indefinida.");
      }
      // Re-validate the output to be extra sure it matches the schema
      const validatedOutput = PlacementTestOutputSchema.parse(output);
      return validatedOutput;
    } catch (error) {
       console.error("Erro em placementTestFlow:", error);
       // Return a default/error state that still matches the output schema type
       return {
         finalLevel: 'A1',
         analysis: 'Ocorreu um erro ao processar seus resultados. Por favor, tente novamente. Por enquanto, seu nível foi definido como A1.',
       };
    }
  }
);
