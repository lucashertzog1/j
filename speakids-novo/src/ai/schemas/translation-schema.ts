
/**
 * @fileOverview Schemas and types for translation evaluation.
 */
import { z } from 'zod';

export const EvaluateTranslationInputSchema = z.object({
  originalText: z.string().describe("The original text in English."),
  referenceTranslation: z.string().describe("The AI-generated reference translation in Portuguese."),
  userTranslation: z.string().describe("The user's attempted translation in Portuguese."),
});
export type EvaluateTranslationInput = z.infer<typeof EvaluateTranslationInputSchema>;

export const EvaluateTranslationOutputSchema = z.object({
  accuracy: z.number().min(0).max(100).describe("A score from 0 to 100 representing the accuracy of the user's translation."),
  feedback: z.string().describe("Constructive feedback for the user in Portuguese, highlighting correct parts and suggesting improvements."),
});
export type EvaluateTranslationOutput = z.infer<typeof EvaluateTranslationOutputSchema>;
