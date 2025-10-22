
'use server';

import { translate, type TranslateInput, type TranslateOutput } from '@/ai/flows/translate-text';
import { textToSpeech, type TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { z } from 'zod';
import { getDailyWord, type DailyWordOutput } from '@/ai/flows/daily-word-flow';
import { getDailySentence, type DailySentenceInput, type DailySentenceOutput } from '@/ai/flows/daily-sentence-flow';
import { evaluatePlacementTest, type PlacementTestInput } from '@/ai/flows/placement-test-flow';
import type { Question } from '@/app/placement-test/questions';
import { generateStory, type StoryGeneratorInput, type StoryGeneratorOutput } from '@/ai/flows/story-generator-flow';
import { evaluateTranslation } from '@/ai/flows/evaluate-translation-flow';
import { EvaluateTranslationInputSchema, type EvaluateTranslationOutput } from '@/ai/schemas/translation-schema';


type TranslateState = TranslateOutput & {
  error?: string | null;
}

export async function translateText(textToTranslate: string, context: string): Promise<TranslateState> {
  if (!textToTranslate || !context) {
    return { translation: '', explanation: '', synonyms: [], error: 'Texto ou contexto inválido.' };
  }
  try {
    const input: TranslateInput = { text: textToTranslate, context: context };
    const result = await translate(input);
    if (!result || !result.translation || !result.explanation || !result.synonyms) {
       throw new Error('A resposta da IA está incompleta.');
    }
    return { ...result, error: null };
  } catch (e) {
    console.error('Falha na tradução:', e);
    return { 
        translation: '', 
        explanation: '',
        synonyms: [], 
        error: 'Não foi possível traduzir a palavra. Por favor, tente novamente mais tarde.' 
    };
  }
}

type SpeakState = {
  audioData?: string | null;
  error?: string | null;
}

export async function speakText(textToSpeak: string): Promise<SpeakState> {
  const validatedFields = z.object({ textToSpeak: z.string().min(1) }).safeParse({ textToSpeak });

  if (!validatedFields.success) {
    return { error: 'O texto não pode estar vazio.' };
  }
  
  try {
    const input: TextToSpeechInput = { text: validatedFields.data.textToSpeak };
    const result = await textToSpeech(input);
    return { audioData: result.audioData, error: null };
  } catch (e) {
    console.error(e);
    return { audioData: null, error: 'Não foi possível gerar o áudio. Por favor, tente novamente.' };
  }
}

export async function completeActivity(): Promise<{ success: boolean }> {
    // This function no longer saves progress to the database.
    // It always returns a success state to avoid showing errors to the user.
    console.log(`Activity completed. Progress is not saved.`);
    return { success: true };
}

export async function fetchDailyWord(): Promise<DailyWordOutput> {
    try {
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailyWord({ cacheBuster });
        if (!result || !result.word || !result.hint) {
            throw new Error('A resposta da IA para a palavra diária está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar a palavra diária:', e);
        return { word: 'PANDA', hint: 'Um urso preto e branco da China.' };
    }
}

export async function fetchDailySentence(level: DailySentenceInput['level']): Promise<DailySentenceOutput> {
    try {
        const cacheBuster = new Date().toISOString() + Math.random();
        const result = await getDailySentence({ level, cacheBuster });
        if (!result || !result.sentence) {
            throw new Error('A resposta da IA para a frase diária está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar a frase diária:', e);
        return { sentence: 'The cat is on the table.' };
    }
}

export async function getPlacementTestQuestions(): Promise<Question[]> {
  // Returning static questions as we removed database logic.
  return placementTestQuestions;
}

const placementTestSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    question: z.string(),
    level: z.string(),
    isCorrect: z.boolean(),
    selectedOption: z.string(),
  })).min(1, 'Pelo menos uma resposta deve ser fornecida.'),
});

export async function submitPlacementTest(
    submission: z.infer<typeof placementTestSubmissionSchema>
) {
    const validated = placementTestSubmissionSchema.safeParse(submission);
    if (!validated.success) {
        console.error("Falha na validação do envio do teste de nivelamento:", validated.error);
        return { success: false, error: 'Dados de envio inválidos.' };
    }

    const { answers } = validated.data;

    try {
        const evaluationResult = await evaluatePlacementTest({ answers });

        if (!evaluationResult || !evaluationResult.finalLevel || !evaluationResult.analysis) {
            throw new Error("A avaliação da IA falhou em retornar um resultado válido.");
        }
        
        // We no longer update the database, just return the result.
        
        return { 
            success: true, 
            finalLevel: evaluationResult.finalLevel,
            analysis: evaluationResult.analysis 
        };

    } catch (error) {
        console.error('Erro ao enviar o teste de nivelamento:', error);
        return { success: false, error: 'Não foi possível processar os resultados do seu teste.' };
    }
}

const placementTestQuestions: Question[] = [
  // A1 Level (3 questions)
  {
    id: 'a1-g1',
    level: 'A1',
    skill: 'Grammar',
    question: 'I ___ happy.',
    options: [
      { id: 'a', text: 'am' },
      { id: 'b', text: 'is' },
      { id: 'c', text: 'are' },
    ],
    correctOption: 'a',
  },
  {
    id: 'a1-v1',
    level: 'A1',
    skill: 'Vocabulary',
    question: 'Which word means "mesa" in English?',
    options: [
      { id: 'a', text: 'Table' },
      { id: 'b', text: 'Chair' },
      { id: 'c', text: 'Door' },
    ],
    correctOption: 'a',
  },
  {
    id: 'a1-r1',
    level: 'A1',
    skill: 'Reading',
    question: 'Read the text: "This is my dog. He is big." What size is the dog?',
    options: [
      { id: 'a', text: 'Big' },
      { id: 'b', text: 'Small' },
      { id: 'c', text: 'It is a cat' },
    ],
    correctOption: 'a',
  },

  // A2 Level (3 questions)
  {
    id: 'a2-g1',
    level: 'A2',
    skill: 'Grammar',
    question: 'She ___ to school every day.',
    options: [
      { id: 'a', text: 'go' },
      { id: 'b', text: 'goes' },
      { id: 'c', text: 'is going' },
    ],
    correctOption: 'b',
  },
  {
    id: 'a2-v1',
    level: 'A2',
    skill: 'Vocabulary',
    question: 'Where can you borrow books?',
    options: [
      { id: 'a', text: 'Library' },
      { id: 'b', text: 'Hospital' },
      { id: 'c', text: 'Market' },
    ],
    correctOption: 'a',
  },
  {
    id: 'a2-v2',
    level: 'A2',
    skill: 'Vocabulary',
    question: 'What is the opposite of "hot"?',
    options: [
      { id: 'a', text: 'Warm' },
      { id: 'b', text: 'Cold' },
      { id: 'c', text: 'Cool' },
    ],
    correctOption: 'b',
  },

  // B1 Level (3 questions)
  {
    id: 'b1-g1',
    level: 'B1',
    skill: 'Grammar',
    question: 'Yesterday we ___ a great movie.',
    options: [
      { id: 'a', text: 'saw' },
      { id: 'b', text: 'seen' },
      { id: 'c', text: 'see' },
    ],
    correctOption: 'a',
  },
  {
    id: 'b1-r1',
    level: 'B1',
    skill: 'Reading',
    question: 'Read the text: "The train was delayed because of heavy rain." Why was the train late?',
    options: [
      { id: 'a', text: 'Because of strong rain' },
      { id: 'b', text: 'Mechanical failure' },
      { id: 'c', text: 'Free coffee' },
    ],
    correctOption: 'a',
  },
  {
    id: 'b1-v1',
    level: 'B1',
    skill: 'Vocabulary',
    question: 'Which word is a synonym for "help"?',
    options: [
      { id: 'a', text: 'Assist' },
      { id: 'b', text: 'Avoid' },
      { id: 'c', text: 'Argue' },
    ],
    correctOption: 'a',
  },

  // B2 Level (3 questions)
  {
    id: 'b2-g1',
    level: 'B2',
    skill: 'Grammar',
    question: 'If I ___ more time, I would travel the world.',
    options: [
      { id: 'a', text: 'had' },
      { id: 'b', text: 'have' },
      { id: 'c', text: 'would have' },
    ],
    correctOption: 'a',
  },
  {
    id: 'b2-v1',
    level: 'B2',
    skill: 'Vocabulary',
    question: 'Which is a more formal word for "start"?',
    options: [
      { id: 'a', text: 'Commence' },
      { id: 'b', text: 'Open' },
      { id: 'c', 'text': 'Create' },
    ],
    correctOption: 'a',
  },
   {
    id: 'b2-g2',
    level: 'B2',
    skill: 'Grammar',
    question: 'By the time we arrived, the movie ___ already started.',
    options: [
      { id: 'a', text: 'has' },
      { id: 'b', text: 'had' },
      { id: 'c', text: 'was' },
    ],
    correctOption: 'b',
  },
  
    // C1 Level (3 questions)
  {
    id: 'c1-v1',
    level: 'C1',
    skill: 'Vocabulary',
    question: 'The word "ubiquitous" means:',
    options: [
      { id: 'a', text: 'Rare and hard to find' },
      { id: 'b', text: 'Present, appearing, or found everywhere' },
      { id: 'c', text: 'Powerful and influential' },
    ],
    correctOption: 'b',
  },
    {
    id: 'c1-g1',
    level: 'C1',
    skill: 'Grammar',
    question: 'Choose the correct sentence:',
    options: [
      { id: 'a', text: 'Had I known you were coming, I would have baked a cake.' },
      { id: 'b', text: 'If I would have known you were coming, I had baked a cake.' },
      { id: 'c', text: 'If I knew you were coming, I baked a cake.' },
    ],
    correctOption: 'a',
  },
  {
    id: 'c1-r1',
    level: 'C1',
    skill: 'Reading',
    question: 'What does the idiom "to beat around the bush" mean?',
    options: [
      { id: 'a', text: 'To speak directly and to the point.' },
      { id: 'b', text: 'To work hard on a gardening project.' },
      { id: 'c', text: 'To avoid talking about the main topic.' },
    ],
    correctOption: 'c',
  },
];


export async function fetchNewStory(input: StoryGeneratorInput): Promise<StoryGeneratorOutput> {
    try {
        const result = await generateStory({
            ...input,
            cacheBuster: new Date().toISOString() + Math.random(),
        });
        if (!result || !result.title || !result.content || !result.level) {
            throw new Error('A resposta da IA para a história está incompleta.');
        }
        return result;
    } catch(e) {
        console.error('Falha ao buscar nova história:', e);
        return { 
            title: 'O Dragão Amigável', 
            content: 'Once upon a time, there was a friendly dragon. He did not breathe fire. He breathed bubbles! All the children in the village loved to play in his bubbles.',
            level: 'A1',
            translation: 'Era uma vez um dragão amigável. Ele não cuspia fogo. Ele soprava bolhas! Todas as crianças da aldeia adoravam brincar em suas bolhas.'
        };
    }
}

export async function handleTranslationEvaluation(
    prevState: EvaluateTranslationOutput | null,
    formData: FormData
): Promise<EvaluateTranslationOutput | { error: string }> {
    const validatedFields = EvaluateTranslationInputSchema.safeParse({
        originalText: formData.get('originalText'),
        referenceTranslation: formData.get('referenceTranslation'),
        userTranslation: formData.get('userTranslation'),
    });

    if (!validatedFields.success) {
        return {
            error: 'Dados de entrada inválidos. Tente novamente.',
        };
    }

    try {
        const result = await evaluateTranslation(validatedFields.data);
        return result;
    } catch (e: any) {
        console.error('Falha na avaliação da tradução:', e);
        return { error: 'Ocorreu um erro ao avaliar sua tradução. Por favor, tente novamente.' };
    }
}

    