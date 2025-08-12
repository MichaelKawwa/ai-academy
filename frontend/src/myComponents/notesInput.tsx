import { Flex, Textarea, IconButton } from '@chakra-ui/react';
import type { TextareaProps } from '@chakra-ui/react';
import { LuSend } from 'react-icons/lu';
import { forwardRef } from 'react';

// We can extend TextareaProps to get all the native textarea attributes
interface NotesInputProps extends TextareaProps {
  // We only need to define the props that aren't already in TextareaProps
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

export const NotesInput = forwardRef<HTMLTextAreaElement, NotesInputProps>(
  ({ onSubmit, isSubmitDisabled, ...props }, ref) => {
    return (
      <Flex
        w="full"
        maxW="2xl"
        position="relative"
        // Style the container to look like the input field
        bg="bg.surface"
        border="1px solid"
        borderColor="border.default"
        borderRadius="xl" // This will use the 'xl' from your recipes
        align="flex-end"
        px={2}
        py={1.5}
        // Add a focus ring to the whole container for a better UX
        _focusWithin={{
          borderColor: 'primary',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
        }}
        transition="all 0.2s ease-in-out"
      >
        <Textarea
          ref={ref}
          rows={6}
          p={2} // Add some internal padding
          // Pass down all other props like `value`, `onChange`, `placeholder`
          autoresize
          {...props}
        />
        <IconButton
          aria-label="Submit"
          borderRadius="full"
          variant="ghost"
          // Use the `primary` semantic token from your theme
          colorScheme="primary"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          alignSelf="flex-end"
          mb={1}
        >
          <LuSend />
        </IconButton>
      </Flex>
    );
  }
);