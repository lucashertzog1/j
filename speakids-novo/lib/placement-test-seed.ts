
import type { Question } from "@/app/placement-test/questions";

export const placementTestQuestions: Question[] = [
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
      { id: 'c', text: 'Create' },
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

    