
'use server';

/**
 * @fileOverview A flow for generating cards for the Memory Game.
 *
 * - generateMemoryGameCards - A function that generates 6 pairs of words and images.
 * - MemoryGameCard - The type for a single card.
 * - MemoryGameOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const wordList = [
    "dog", "cat", "fish", "bird", "sun", "moon", 
    "tree", "flower", "house", "car", "boat", "star",
    "apple", "ball", "book", "hat", "train", "frog"
];

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const MemoryGameCardSchema = z.object({
  word: z.string(),
  imageUrl: z.string().describe("The data URI of the generated image."),
});
export type MemoryGameCard = z.infer<typeof MemoryGameCardSchema>;

const MemoryGameOutputSchema = z.object({
    cards: z.array(MemoryGameCardSchema),
});
export type MemoryGameOutput = z.infer<typeof MemoryGameOutputSchema>;

export async function generateMemoryGameCards(): Promise<MemoryGameOutput> {
  return memoryGameFlow();
}

const memoryGameFlow = ai.defineFlow(
  {
    name: 'memoryGameFlow',
    outputSchema: MemoryGameOutputSchema,
  },
  async () => {
    // 1. Select 6 random words from the list
    const selectedWords = shuffleArray(wordList).slice(0, 6);

    // 2. Generate an image for each word in parallel
    const imagePromises = selectedWords.map(word => 
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A very simple, cute, and colorful cartoon-style image of a single object: ${word}. The image should be on a clean white background, clear and easily recognizable for a child. No text or other elements.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        })
    );

    const imageResults = await Promise.all(imagePromises);

    const cards = imageResults.map((result, index) => {
        if (!result.media.url) {
            throw new Error(`Image generation failed for word: ${selectedWords[index]}`);
        }
        return {
            word: selectedWords[index],
            imageUrl: result.media.url,
        };
    });

    return { cards };
  }
);
