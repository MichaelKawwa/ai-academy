"use client"; 

import { useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import { generateQuiz } from '@/services/quizService';
import type { QuizQuestion } from '@/types';
import { ContentInput } from './contentInput'; 
import { QuizTaker } from './quizTaker';
import { QuizResults } from './quizResults';

type AppState = 'input' | 'loading' | 'taking' | 'results';

export const QuizApp = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const handleGenerateQuiz = async (files: File[], notes: string) => {
    setAppState('loading');
    try {
      const response = await generateQuiz(files, notes);
      if (response.quiz && response.quiz.length > 0) {
        setQuizData(response.quiz);
        setAppState('taking');
      } else {
        // 👇 This code is now correct because it uses the imported toaster object
        toaster.create({
          title: "Couldn't generate quiz.",
          description: "The AI couldn't create a quiz from the provided content. Please try again.",
          type: "warning",
        });
        setAppState('input');
      }
    } catch (error) {
      toaster.create({
        title: "An error occurred.",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        type: "error",
      });
      setAppState('input');
    }
  };

  const handleFinishQuiz = (answers: Record<number, string>) => {
    setUserAnswers(answers);
    setAppState('results');
  };

  const handleRetry = () => {
    setQuizData(null);
    setUserAnswers({});
    setAppState('input');
  };

  const renderContent = () => {
    switch (appState) {
      case 'taking':
        return quizData && <QuizTaker quiz={quizData} onSubmit={handleFinishQuiz} />;
      case 'results':
        return quizData && <QuizResults quiz={quizData} userAnswers={userAnswers} onRetry={handleRetry} />;
      case 'input':
      case 'loading':
      default:
        return <ContentInput onSubmit={handleGenerateQuiz} isLoading={appState === 'loading'} />;
    }
  };

  return <>{renderContent()}</>;
};