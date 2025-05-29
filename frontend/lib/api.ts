const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  difficulty: string;
  pointValue: number;
  hasReference: boolean;
  submissionCount: number;
  isActive: boolean;
  tags: string[];
  timeLimit?: number;
  allowFileUpload: boolean;
  allowTextAnswer: boolean;
  dueDate?: string;
}

export interface EvaluationRequest {
  question: string;
  model_answer: string;
  student_answer: string;
}

export interface EvaluationResponse {
  score: number;
  error?: string;
}

export interface UploadResponse {
  message: string;
  error?: string;
}

export interface AssignmentResponse {
  message: string;
  score: number;
  feedback: string;
  error?: string;
}

export interface Result {
  student_id: number;
  file_path: string;
  score: number;
  feedback: string;
  timestamp: string;
}

export const api = {
  // Question Management
  getQuestions: async (): Promise<Question[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  createQuestion: async (data: Omit<Question, 'id' | 'submissionCount'>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create question');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  updateQuestion: async (id: string, data: Partial<Question>): Promise<Question> => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update question');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  deleteQuestion: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Evaluate answer
  evaluateAnswer: async (data: EvaluationRequest): Promise<EvaluationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        return { score: 0, error: result.error || 'Failed to evaluate answer' };
      }
      return result;
    } catch (error) {
      return { score: 0, error: 'Failed to evaluate answer' };
    }
  },

  // Upload teacher guide
  uploadTeacherGuide: async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload_teacher_guide`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        return { message: '', error: result.error || 'Failed to upload teacher guide' };
      }
      return result;
    } catch (error) {
      return { message: '', error: 'Failed to upload teacher guide' };
    }
  },

  // Upload student assignment
  uploadAssignment: async (file: File, studentId: number): Promise<AssignmentResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', studentId.toString());

      const response = await fetch(`${API_BASE_URL}/upload_assignment`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        return { 
          message: '', 
          score: 0, 
          feedback: '', 
          error: result.error || 'Failed to upload assignment' 
        };
      }
      return result;
    } catch (error) {
      return { 
        message: '', 
        score: 0, 
        feedback: '', 
        error: 'Failed to upload assignment' 
      };
    }
  },

  // Get results
  getResults: async (userId: number, userType: 'student' | 'teacher'): Promise<Result[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_results/${userId}/${userType}`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  },
}; 