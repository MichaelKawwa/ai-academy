export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  topic: string;
}

export interface QuizResponse {
  quiz: QuizQuestion[];
  metadata: Record<string, any>;
}