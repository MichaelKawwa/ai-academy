import { useState } from 'react';
import { VStack, Button } from '@chakra-ui/react';
import { FileDropzone } from './fileDropzone';
import { NotesInput } from './notesInput';

// New props for the component
interface ContentInputProps {
  onSubmit: (files: File[], notes: string) => void;
  isLoading: boolean;
}

export const ContentInput = ({ onSubmit, isLoading }: ContentInputProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');

  // This internal handler just packages the state up for the parent
  const handleFormSubmit = () => {
    onSubmit(files, notes);
  };
  
  const canSubmit = (files.length > 0 || notes.trim().length > 0) && !isLoading;

  return (
    <VStack gap={8} w="full" py={10}>
      {/* ... VStacks for Heading and Text are unchanged ... */}
      <FileDropzone files={files} setFiles={setFiles} />
      <NotesInput
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onSubmit={handleFormSubmit}
        isSubmitDisabled={!canSubmit}
        placeholder="Or paste your notes here..."
      />
      <Button
        size="lg"
        bg="primary"
        color="white"
        onClick={handleFormSubmit}
        loading={isLoading}
        disabled={!canSubmit}
      >
        Generate Quiz
      </Button>
    </VStack>
  );
};