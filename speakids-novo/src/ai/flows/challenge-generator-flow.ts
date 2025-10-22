
'use server';

/**
 * @fileOverview A flow for generating a random image guessing challenge based on difficulty.
 *
 * - generateChallenge - A function that handles the image and word generation.
 * - ChallengeGeneratorInput - The input type for the generateChallenge function.
 * - ChallengeGeneratorOutput - The return type for the generateChallenge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Word lists categorized by difficulty
const easyWords = ["apple", "ball", "car", "dog", "house", "tree", "sun", "book", "chair", "hat"];
const mediumWords = ["astronaut", "guitar", "microscope", "dragon", "library", "volcano", "telescope", "engineer", "waterfall", "butterfly"];
const hardWords = ["a chameleon on a rainbow", "a clock melting like in a Dali painting", "a city floating in the clouds", "a lion wearing a crown and reading a book", "an orchestra of robot musicians", "a treehouse shaped like a spaceship", "a philosophical squirrel drinking tea", "an underwater library with fish swimming by"];


const ChallengeGeneratorInputSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty level for the challenge."),
  cacheBuster: z.string().optional().describe("A random string to bypass cache."),
});
export type ChallengeGeneratorInput = z.infer<typeof ChallengeGeneratorInputSchema>;

const ChallengeGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image."),
  word: z.string().describe("The word or phrase the user needs to guess."),
});
export type ChallengeGeneratorOutput = z.infer<typeof ChallengeGeneratorOutputSchema>;

export async function generateChallenge(input: ChallengeGeneratorInput): Promise<ChallengeGeneratorOutput> {
  return challengeGeneratorFlow(input);
}

const challengeGeneratorFlow = ai.defineFlow(
  {
    name: 'challengeGeneratorFlow',
    inputSchema: ChallengeGeneratorInputSchema,
    outputSchema: ChallengeGeneratorOutputSchema,
  },
  async ({ difficulty }) => {
    // 1. Select a word list based on difficulty
    let selectedWordList;
    if (difficulty === 'Easy') {
      selectedWordList = easyWords;
    } else if (difficulty === 'Medium') {
      selectedWordList = mediumWords;
    } else {
      selectedWordList = hardWords;
    }

    const wordToGuess = selectedWordList[Math.floor(Math.random() * selectedWordList.length)];

    // 2. Generate an image for that word
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Uma imagem de desenho animado simples, fofa e colorida de: ${wordToGuess}. A imagem deve estar em um fundo branco limpo, clara e facilmente reconhecível.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('A geração de imagem falhou ao retornar uma URL.');
    }

    // 3. Return both the image URL and the word
    return {
      imageUrl: media.url,
      word: wordToGuess,
    };
  }
);
