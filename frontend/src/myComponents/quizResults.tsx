import type { QuizQuestion } from '@/types';
import {
  Button,
  Heading,
  VStack,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { LuCircleCheck, LuCircleX } from 'react-icons/lu';

interface QuizResultsProps {
  quiz: QuizQuestion[];
  userAnswers: Record<number, string>;
  onRetry: () => void;
}

export const QuizResults = ({ quiz, userAnswers, onRetry }: QuizResultsProps) => {
  const score = quiz.reduce((total, question, index) => {
    return userAnswers[index] === question.answer ? total + 1 : total;
  }, 0);

  const scorePercent = Math.round((score / quiz.length) * 100);

  return (
    <VStack gap={8} w="full" maxW="3xl" py={10}>
      <VStack gap={2} textAlign="center">
        <Heading size="2xl">Quiz Complete!</Heading>
        <Text fontSize="xl" color="text.default">You scored</Text>
        <Heading size="4xl" color="primary">{score} / {quiz.length} ({scorePercent}%)</Heading>
      </VStack>

      <VStack gap={6} w="full" align="stretch">
        {quiz.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.answer;
          return (
            <VStack key={index} align="flex-start" gap={2}>
              <HStack>
                <Icon as={isCorrect ? LuCircleCheck : LuCircleX} color={isCorrect ? 'green.500' : 'red.500'} />
                <Text fontWeight="bold">{index + 1}. {question.question}</Text>
              </HStack>
              <Text fontSize="sm">Your answer: <Text as="span" color={isCorrect ? 'green.500' : 'red.500'}>{userAnswer || 'Not answered'}</Text></Text>
              {!isCorrect && (
                <Text fontSize="sm">Correct answer: <Text as="span" color="green.500">{question.answer}</Text></Text>
              )}
            </VStack>
          );
        })}
      </VStack>
      
      <Button size="lg" onClick={onRetry}>Take Another Quiz</Button>
    </VStack>
  );
};