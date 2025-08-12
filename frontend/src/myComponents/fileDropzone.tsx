import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { Center, VStack, Text, Icon, HStack, IconButton } from '@chakra-ui/react';
import { LuCloudUpload, LuFile, LuX } from 'react-icons/lu';
import { useColorModeValue } from '@/components/ui/color-mode';

interface FileDropzoneProps {
    files: File[];
    setFiles: (files: File[]) => void;
}

export const FileDropzone = ({ files, setFiles }: FileDropzoneProps) => {

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            console.warn('File rejected:', fileRejections);
        }
        setFiles([...files, ...acceptedFiles]);
    }, [files, setFiles]);

        const removeFile = (fileToRemove: File) => {
            setFiles(files.filter(file => file !== fileToRemove));
        };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const dropzoneActiveBg = useColorModeValue('brand.greenDark', 'brand.green');

    return (
         <VStack gap={4} w="100%"> 
            <Center
                {...getRootProps()}
                p={10}
                w="100%"
                maxW={"2xl"}
                cursor={isDragActive ? 'copy' : 'pointer'}
                bg={isDragActive ? dropzoneActiveBg : "bg.file"}
                border="2px dashed"
                borderColor={isDragActive ? 'secondary' : "bg.file"}
                borderRadius="xl"
                transition={'background-color 0.2s ease, border-color 0.2s ease'}>
                    <input {...getInputProps()} />
                     <VStack>
                        <Icon as={LuCloudUpload} boxSize={12} color="gray.500" />
                        <Text fontWeight="medium">Drag & drop files here, or click to select</Text>
                        <Text fontSize="sm" color="gray.500">
                            PDFs, documents, or other files
                        </Text>
                    </VStack>
                </Center>
            {files.length > 0 && (
                <VStack w="full" maxW="2xl" align="stretch" gap={2}>
                    {files.map((file, index) => (
                        <HStack
                        key={index}
                        p={3}
                        bg="bg.surface"
                        border="1px solid"
                        borderColor="border.default"
                        borderRadius="md"
                        justify="space-between"
                        >
                        <HStack>
                            <Icon as={LuFile} color="gray.500" />
                            <Text fontSize="sm" lineClamp={1}>{file.name}</Text>
                        </HStack>
                        <IconButton
                            aria-label="Remove file"
                            size="xs"
                            variant="ghost"
                            onClick={() => removeFile(file)}
                        >
                            <Icon as={LuX} boxSize={4} color="red.500" />
                        </IconButton>
                        </HStack>
                 ))}
                </VStack>
            )}
        </VStack>
    );
}

