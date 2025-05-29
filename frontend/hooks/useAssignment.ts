import { useState } from 'react';
import { api, EvaluationRequest, EvaluationResponse, Result } from '@/lib/api';

export const useAssignment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateAnswer = async (data: EvaluationRequest): Promise<EvaluationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.evaluateAnswer(data);
      if (response.error) {
        setError(response.error);
        return response;
      }
      return response;
    } catch (err) {
      const errorMessage = 'Failed to evaluate answer';
      setError(errorMessage);
      return { score: 0, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const uploadTeacherGuide = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadTeacherGuide(file);
      if (response.error) {
        setError(response.error);
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to upload teacher guide');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAssignment = async (file: File, studentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadAssignment(file, studentId);
      if (response.error) {
        setError(response.error);
        return null;
      }
      return {
        score: response.score,
        feedback: response.feedback,
      };
    } catch (err) {
      setError('Failed to upload assignment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getResults = async (userId: number, userType: 'student' | 'teacher') => {
    setLoading(true);
    setError(null);
    try {
      const results = await api.getResults(userId, userType);
      return results;
    } catch (err) {
      setError('Failed to fetch results');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    evaluateAnswer,
    uploadTeacherGuide,
    uploadAssignment,
    getResults,
  };
}; 