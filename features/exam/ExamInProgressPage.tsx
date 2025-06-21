
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useExam } from '../../contexts/ExamContext';
import { ExamCategory, Question } from '../../types';
import { QuestionDisplay } from './QuestionDisplay';
import { Timer } from './Timer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { FormulaSheetModal } from './FormulaSheetModal';
import { AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, BookOpen, Info } from 'lucide-react';

export const ExamInProgressPage: React.FC = () => {
  const { category: categoryFromParams } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentExamConfig,
    currentCategory,
    userAnswers,
    submitAnswer,
    finishExam,
    resetExam,
    startExam,
  } = useExam();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFormulaSheetOpen, setIsFormulaSheetOpen] = useState(false);
  const [errorLoadingExam, setErrorLoadingExam] = useState<string | null>(null);
  const isTrialMode = location.state?.isTrial === true;


  useEffect(() => {
    const decodedCategory = decodeURIComponent(categoryFromParams || '') as ExamCategory;

    if (!Object.values(ExamCategory).includes(decodedCategory)) {
      console.error('Invalid exam category in URL:', categoryFromParams);
      setErrorLoadingExam('Invalid exam category specified.');
      setIsLoading(false);
      return;
    }

    const initializeExam = async () => {
      setIsLoading(true);
      setErrorLoadingExam(null);
      try {
        // Condition to restart: if no config, or category changed, or trial status changed
        if (!currentExamConfig || currentCategory !== decodedCategory || currentExamConfig.isTrial !== isTrialMode) {
          resetExam(); 
          await startExam(decodedCategory, isTrialMode);
        }
      } catch (error) {
        console.error("Failed to initialize exam:", error);
        setErrorLoadingExam(error instanceof Error ? error.message : "An unknown error occurred while loading the exam.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
    setCurrentQuestionIndex(0); 

  }, [categoryFromParams, startExam, resetExam, currentCategory, currentExamConfig, navigate, location.key, isTrialMode]);


  const handleTimeUp = useCallback(() => {
    alert("Time's up! Submitting your exam.");
    if (currentCategory) {
        finishExam();
        navigate(`/results/${encodeURIComponent(currentCategory)}`, { state: { isTrial: isTrialMode } });
    } else {
        navigate('/exam-selection');
    }
  }, [finishExam, navigate, currentCategory, isTrialMode]);

  if (isLoading) {
    return <LoadingSpinner text="Loading exam..." className="mt-10" />;
  }

  if (errorLoadingExam) {
    return (
      <div className="text-center mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-red-700">Error Loading Exam</h2>
        <p className="text-textSecondary mt-2">{errorLoadingExam}</p>
        <button
          onClick={() => navigate('/exam-selection', { replace: true })}
          className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Return to Exam Selection
        </button>
      </div>
    );
  }
  
  if (!currentExamConfig || !currentCategory) {
    return (
        <div className="text-center mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-yellow-700">Exam Not Ready</h2>
            <p className="text-textSecondary mt-2">The exam configuration is not available. Please try selecting an exam again.</p>
            <button
            onClick={() => navigate('/exam-selection')}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
            Return to Exam Selection
            </button>
        </div>
    );
  }

  const currentQuestion: Question | undefined = currentExamConfig.questions[currentQuestionIndex];
  const currentUserAnswer = userAnswers.find(ans => ans.questionId === currentQuestion?.id);

  if (!currentQuestion) {
    return (
      <div className="text-center mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-red-700">Error: Question Not Found</h2>
        <p className="text-textSecondary mt-2">Could not load the current question.</p>
        <button
          onClick={() => navigate('/exam-selection')}
          className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Return to Exam Selection
        </button>
      </div>
    );
  }

  const handleAnswerSelect = (optionIndex: number) => {
    submitAnswer(currentQuestion.id, optionIndex);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentExamConfig.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmitExam = () => {
    finishExam();
    navigate(`/results/${encodeURIComponent(currentCategory)}`, { state: { isTrial: isTrialMode } });
    setShowConfirmModal(false);
  };

  const progressPercentage = ((currentQuestionIndex + 1) / currentExamConfig.questions.length) * 100;
  const answeredQuestionsCount = userAnswers.filter(ans => ans.selectedOptionIndex !== null).length;

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6 p-4 bg-primary-light text-white rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">
          {isTrialMode ? 'Trial Exam: ' : ''}{currentCategory}
        </h1>
        <Timer durationMinutes={currentExamConfig.durationMinutes} onTimeUp={handleTimeUp} isRunning={true} />
      </header>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto flex-grow">
            <div className="flex justify-between text-sm text-textSecondary mb-1">
                <span>Progress: {currentQuestionIndex + 1} / {currentExamConfig.questions.length}</span>
                <span>Answered: {answeredQuestionsCount} / {currentExamConfig.questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-accent h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
        <button
          onClick={() => setIsFormulaSheetOpen(true)}
          className="mt-2 sm:mt-0 flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors text-sm font-medium shadow"
        >
          <BookOpen size={18} className="mr-2" />
          Formula Sheet
        </button>
      </div>

      <QuestionDisplay
        question={currentQuestion}
        userAnswer={currentUserAnswer}
        onAnswerSelect={handleAnswerSelect}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={currentExamConfig.questions.length}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          <ChevronLeft size={20} className="mr-2" /> Previous
        </button>
        {currentQuestionIndex === currentExamConfig.questions.length - 1 ? (
          <button
            onClick={handleSubmitExam}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-green-600 transition-colors shadow"
          >
            <CheckCircle size={20} className="mr-2" /> Submit Exam
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow"
          >
            Next <ChevronRight size={20} className="ml-2" />
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="text-center">
              <Info size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-textPrimary mb-2">Confirm Submission</h3>
              <p className="text-textSecondary mb-6">
                Are you sure you want to finish and submit your exam? Any unanswered questions will be marked as incorrect.
              </p>
            </div>
            <div className="flex justify-around">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitExam}
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
      <FormulaSheetModal isOpen={isFormulaSheetOpen} onClose={() => setIsFormulaSheetOpen(false)} />
    </div>
  );
};
