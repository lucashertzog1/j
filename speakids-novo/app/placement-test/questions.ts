
export type Question = {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skill: 'Grammar' | 'Vocabulary' | 'Reading';
  question: string;
  options: { id: 'a' | 'b' | 'c'; text: string }[];
  correctOption: 'a' | 'b' | 'c';
};

    