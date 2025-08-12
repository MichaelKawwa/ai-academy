import { useState } from 'react';
import type { QuizQuestion } from '@/types';
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  RadioGroup,
  Progress,
  HStack,
} from '@chakra-ui/react';

interface QuizTakerProps {
  quiz: QuizQuestion[];
  onSubmit: (answers: Record<number, string>) => void;
}

export const QuizTaker = ({ quiz, onSubmit }: QuizTakerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = quiz[currentIndex];
  const progressPercent = ((currentIndex + 1) / quiz.length) * 100;

  // The separate handleAnswerChange function has been REMOVED.

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <VStack gap={6} w="full" maxW="3xl" py={10}>
      <Box w="full">
        <HStack justify="space-between" mb={1}>
          <Text fontSize="sm" color="text.default">Question {currentIndex + 1} of {quiz.length}</Text>
          <Text fontSize="sm" color="secondary" textTransform="capitalize" fontWeight="bold">{currentQuestion.difficulty}</Text>
        </HStack>
        
        <Progress.Root value={progressPercent} size="sm" colorScheme="primary" borderRadius="full">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>

      </Box>

      <VStack align="flex-start" w="full" gap={4}>
        <Heading size="lg" fontFamily="heading">{currentQuestion.question}</Heading>
        
        <RadioGroup.Root
          w="full"
          display="flex"
          flexDirection="column"
          gap={3}
          value={answers[currentIndex] || ''}
          onValueChange={(details) => {
            if (details.value) {
              setAnswers({ ...answers, [currentIndex]: details.value });
            }
          }}
        >
          {currentQuestion.options.map((option, index) => (
            <RadioGroup.Item
              key={index}
              value={option}
              display="flex"
              alignItems="center"
              gap={3}
              p={4}
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'bg.file' }}
              _checked={{ 
                borderColor: 'primary', 
                bg: 'bg.file',
                boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
              }}
            >
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText fontSize="md">{option}</RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>

      </VStack>

      <HStack w="full" justify="space-between">
        <Button onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        {currentIndex === quiz.length - 1 ? (
          <Button bg="primary" color="white" onClick={() => onSubmit(answers)}>
            Finish Quiz
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </HStack>
    </VStack>
  );
};