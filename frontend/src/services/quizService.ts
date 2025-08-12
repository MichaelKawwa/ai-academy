import type { QuizResponse } from "../types.ts";

// IMPORTANT: Replace this with the actual URL of your FastAPI backend.
// If your Next.js app is on the same domain or you have a proxy, you can use a relative path.
const API_URL = 'http://localhost:8000';

export const generateQuiz = async (
  files: File[],
  notes: string
): Promise<QuizResponse> => {
  const formData = new FormData();

  // FastAPI expects the text content under a 'content' key, which is a list.
  if (notes.trim()) {
    formData.append('content', notes);
  }

  files.forEach((file) => {
    formData.append('files', file, file.name);
  });

  const response = await fetch(`${API_URL}/api/generate-quiz`, {
    method: 'POST',
    body: formData,
    // Note: Do not set 'Content-Type' header. The browser will automatically set it
    // to 'multipart/form-data' with the correct boundary.
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate quiz');
  }

  return response.json();
};