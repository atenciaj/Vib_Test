
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ExamCategory, Question, UserAnswer, ExamResult, ExamConfig } from '../types';
import { fetchQuestionsForCategory, selectRandomQuestions } from '../features/exam/examData';
import { DEFAULT_EXAM_CONFIG, EXAM_PASS_MARK_PERCENT, TRIAL_QUESTION_COUNT, TRIAL_EXAM_DURATION_MINUTES } from '../constants';

interface ExamContextType {
  currentExamConfig: ExamConfig | null;
  currentCategory: ExamCategory | null;
  userAnswers: UserAnswer[];
  examResult: ExamResult | null;
  startExam: (category: ExamCategory, isTrial?: boolean) => Promise<void>;
  submitAnswer: (questionId: string, selectedOptionIndex: number) => void;
  finishExam: () => void;
  resetExam: () => void;
  getQuestionById: (id: string) => Question | undefined;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentExamConfig, setCurrentExamConfig] = useState<ExamConfig | null>(null);
  const [currentCategory, setCurrentCategory] = useState<ExamCategory | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startExam = useCallback(async (category: ExamCategory, isTrial: boolean = false) => {
    try {
      const categoryDefaultConfig = DEFAULT_EXAM_CONFIG[category];
      if (!categoryDefaultConfig) {
        console.error("No default config found for category:", category);
        throw new Error(`Configuration for category ${category} not found.`);
      }
      
      const allCategoryQuestions = await fetchQuestionsForCategory(category);
      if (allCategoryQuestions.length === 0) {
        console.warn(`No questions found for category ${category}. Exam cannot start.`);
        throw new Error(`No questions available for category ${category}.`);
      }
      
      const numQuestions = isTrial ? TRIAL_QUESTION_COUNT : categoryDefaultConfig.questions;
      const duration = isTrial ? TRIAL_EXAM_DURATION_MINUTES : categoryDefaultConfig.duration;

      const selectedQuestions = selectRandomQuestions(allCategoryQuestions, numQuestions);

      if (selectedQuestions.length < numQuestions && selectedQuestions.length > 0) {
        console.warn(`Warning: Requested ${numQuestions} questions for ${category} (${isTrial ? 'trial' : 'full exam'}), but only ${selectedQuestions.length} were available and selected. The exam will proceed with ${selectedQuestions.length} questions.`);
      } else if (selectedQuestions.length === 0 && numQuestions > 0) {
        console.error(`Error: No questions could be selected for ${category}. Exam cannot start with zero questions if questions are expected.`);
        throw new Error(`Failed to select questions for ${category}.`);
      }
      
      setCurrentExamConfig({
        questions: selectedQuestions,
        durationMinutes: duration,
        passMarkPercent: EXAM_PASS_MARK_PERCENT,
        isTrial: isTrial,
      });
      setCurrentCategory(category);
      setUserAnswers(selectedQuestions.map(q => ({ questionId: q.id, selectedOptionIndex: null })));
      setExamResult(null);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error starting exam:", error);
      setCurrentExamConfig(null);
      setCurrentCategory(null);
      setUserAnswers([]);
      setExamResult(null);
      setStartTime(null);
      throw error; 
    }
  }, []);

  const submitAnswer = useCallback((questionId: string, selectedOptionIndex: number) => {
    setUserAnswers(prevAnswers =>
      prevAnswers.map(ans =>
        ans.questionId === questionId
          ? { ...ans, selectedOptionIndex }
          : ans
      )
    );
  }, []);

  const finishExam = useCallback(() => {
    if (!currentExamConfig || !currentCategory || !startTime) return;

    let correctAnswers = 0;
    userAnswers.forEach(answer => {
      const question = currentExamConfig.questions.find(q => q.id === answer.questionId);
      if (question && question.correctOptionIndex === answer.selectedOptionIndex) {
        correctAnswers++;
      }
    });

    const totalQuestions = currentExamConfig.questions.length;
    const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = scorePercent >= currentExamConfig.passMarkPercent;
    const timeTakenMinutes = Math.round((Date.now() - startTime) / (1000 * 60));

    const result: ExamResult = {
      category: currentCategory,
      scorePercent,
      correctAnswers,
      totalQuestions: totalQuestions,
      answers: userAnswers,
      passed,
      timeTakenMinutes,
      isTrial: currentExamConfig.isTrial || false,
    };
    setExamResult(result);

    // Save result to localStorage only if it's not a trial or if we decide to save trials too.
    // For now, let's only save full exams. Trials are ephemeral.
    if (!result.isTrial) {
      const existingResults = JSON.parse(localStorage.getItem('vibTestResults') || '[]') as ExamResult[];
      localStorage.setItem('vibTestResults', JSON.stringify([...existingResults, result]));
    }

  }, [currentExamConfig, currentCategory, userAnswers, startTime]);

  const resetExam = useCallback(() => {
    setCurrentExamConfig(null);
    setCurrentCategory(null);
    setUserAnswers([]);
    setExamResult(null);
    setStartTime(null);
  }, []);

  const getQuestionById = useCallback((id: string): Question | undefined => {
    return currentExamConfig?.questions.find(q => q.id === id);
  }, [currentExamConfig]);

  return (
    <ExamContext.Provider
      value={{
        currentExamConfig,
        currentCategory,
        userAnswers,
        examResult,
        startExam,
        submitAnswer,
        finishExam,
        resetExam,
        getQuestionById,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = (): ExamContextType => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
