import axios, { type AxiosResponse } from 'axios';
import type { QuizResponse } from './types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "http://localhost:8000", 
  headers: {
    'Accept': 'application/json',
  },
});

export async function generateQuiz(form: FormData): Promise<QuizResponse> {
  try {
    const response: AxiosResponse<QuizResponse> = await apiClient.post('/api/generate-quiz', form, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
      responseType: 'json',
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}