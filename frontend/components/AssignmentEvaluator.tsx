'use client';

import { useState } from 'react';
import { useAssignment } from '@/hooks/useAssignment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EvaluationResponse } from '@/lib/api';

export function AssignmentEvaluator() {
  const [question, setQuestion] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [score, setScore] = useState<number | null>(null);
  
  const { evaluateAnswer, loading, error } = useAssignment();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !modelAnswer.trim() || !studentAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setScore(null);
    const result = await evaluateAnswer({
      question,
      model_answer: modelAnswer,
      student_answer: studentAnswer,
    });

    if (result.error) {
      toast({
        title: "Evaluation Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setScore(result.score);
      toast({
        title: "Evaluation Complete",
        description: `Score: ${result.score}`,
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Assignment Evaluator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question..."
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelAnswer">Model Answer</Label>
            <Textarea
              id="modelAnswer"
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Enter the model answer..."
              className="min-h-[200px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentAnswer">Student Answer</Label>
            <Textarea
              id="studentAnswer"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Enter the student's answer..."
              className="min-h-[200px]"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Evaluating..." : "Evaluate Answer"}
          </Button>

          {score !== null && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Score: {score}</h3>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 