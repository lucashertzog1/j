
'use server';

/**
 * @fileOverview A flow for generating a short story based on a selected difficulty level.
 *
 * - generateStory - A function that handles the story generation.
 * - StoryGeneratorInput - The input type for the generateStory function.
 * - StoryGeneratorOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StoryGeneratorInputSchema = z.object({
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The difficulty level for the story."),
  length: z.enum(['Short', 'Medium', 'Long']).describe("The desired length of the story."),
  translateTo: z.string().optional().describe("An optional language to translate the story to (e.g., 'Portuguese')."),
  // Cache buster to ensure a new story is generated every time.
  cacheBuster: z.string().optional(),
});
export type StoryGeneratorInput = z.infer<typeof StoryGeneratorInputSchema>;

const StoryGeneratorOutputSchema = z.object({
  title: z.string().describe("The title of the generated story."),
  content: z.string().describe("The full content of the generated story in English."),
  level: z.string().describe("The CEFR level of the story (e.g., A1, B2, C1)."),
  translation: z.string().optional().describe("The translated content of the story, if requested."),
});
export type StoryGeneratorOutput = z.infer<typeof StoryGeneratorOutputSchema>;

export async function generateStory(input: StoryGeneratorInput): Promise<StoryGeneratorOutput> {
  return storyGeneratorFlow(input);
}

const promptTemplates = {
    Beginner: {
      Short: "a very short story (2-3 sentences)",
      Medium: "a short story (4-5 sentences)",
      Long: "a story (6-7 sentences)",
      level: "A1/A2",
      prompt: "Use basic vocabulary and simple sentence structures. The story should be about a common theme like animals, friendship, or a simple adventure."
    },
    Intermediate: {
      Short: "a short story (4-5 sentences)",
      Medium: "a story (6-8 sentences)",
      Long: "a long story (9-12 sentences)",
      level: "B1/B2",
      prompt: "Use a good range of vocabulary and more complex sentences, including past and future tenses. The plot can be a little more developed, with a clear beginning, middle, and end."
    },
    Advanced: {
      Short: "a short story (5-7 sentences)",
      Medium: "a story (8-10 sentences)",
      Long: "a long story (12-15 sentences)",
      level: "C1/C2",
      prompt: "Use sophisticated, specific, and less common vocabulary. Employ varied and complex sentence structures, including conditional or subjunctive moods. The theme can be more abstract or nuanced."
    }
};

const storyGeneratorFlow = ai.defineFlow(
  {
    name: 'storyGeneratorFlow',
    inputSchema: StoryGeneratorInputSchema,
    outputSchema: StoryGeneratorOutputSchema,
  },
  async ({ difficulty, length, translateTo, cacheBuster }) => {
    const config = promptTemplates[difficulty];
    const lengthDescription = config[length];
    
    const systemPrompt = `
      Generate ${lengthDescription} for a child learning English at a ${config.level} CEFR level.
      - ${config.prompt}
      - Give it a simple, clear title.
      - Your response must be in JSON format with "title", "content", and "level" fields.
      - The level should be "${config.level.split('/')[0]}" or "${config.level.split('/')[1]}".
      ${translateTo ? `
      - After generating the story, add a "translation" field to the JSON with the full and accurate translation of the story's content into ${translateTo}.
      ` : ''}
      - Ignore this cache buster value when generating the story: ${cacheBuster}
    `;

    const prompt = ai.definePrompt({
        name: `storyPrompt_${difficulty}_${length}`,
        output: { schema: StoryGeneratorOutputSchema },
        prompt: systemPrompt,
    });

    const { output } = await prompt();
    
    if (!output) {
        throw new Error('AI failed to generate a story.');
    }
    
    return output;
  }
);
