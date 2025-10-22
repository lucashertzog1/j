'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/daily-word-flow.ts';
import '@/ai/flows/daily-sentence-flow.ts';
import '@/ai/flows/placement-test-flow.ts';
import '@/ai/flows/story-generator-flow.ts';
import '@/ai/flows/evaluate-translation-flow.ts';
import '@/ai/schemas/translation-schema.ts';
