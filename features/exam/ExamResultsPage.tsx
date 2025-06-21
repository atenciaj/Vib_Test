
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useExam } from '../../contexts/ExamContext';
import { QuestionDisplay } from './QuestionDisplay';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AlertTriangle, Award, RefreshCw, ListChecks, CheckCircle, XCircle, Percent, BookOpen as BookOpenIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Question, ExamCategory, ExamResult as ExamResultType } from '../../types';


interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

const RegistrationCallToAction: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-12 p-8 bg-background rounded-xl shadow-xl border border-primary-light text-center">
      <BookOpenIcon size={48} className="text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-textPrimary mb-3">Want to keep preparing?</h2>
      <p className="text-textSecondary mb-6 max-w-xl mx-auto">
        Register now to access the full course with over 100 questions, timed exams, and detailed progress tracking.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 shadow-md"
        >
          Register Now
        </button>
        <button
          onClick={() => navigate('/exam-selection')}
          className="px-8 py-3 bg-gray-200 text-textPrimary font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-md"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
};


export const ExamResultsPage: React.FC = () => {
  const { category: categoryFromUrl } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { examResult, currentExamConfig, getQuestionById, resetExam } = useExam();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [currentResult, setCurrentResult] = useState<ExamResultType | null>(null);

  const isTrialFromState = location.state?.isTrial === true;

  useEffect(() => {
    const decodedCategory = decodeURIComponent(categoryFromUrl || '') as ExamCategory;
    let resultToDisplay: ExamResultType | null = null;

    // Prefer result from context if available and matches category and trial status
    if (examResult && examResult.category === decodedCategory && examResult.isTrial === isTrialFromState) {
      resultToDisplay = examResult;
    } else {
      // Fallback to localStorage if context result is not matching (e.g., page refresh)
      const allResults = JSON.parse(localStorage.getItem('vibTestResults') || '[]') as ExamResultType[];
      // For trials, we don't store them in localStorage currently. If examResult from context is gone, trial results are lost.
      // So, if it's a trial and examResult is not in context, it won't be found here.
      // If it's NOT a trial, look for the last full exam for this category.
      if (!isTrialFromState) {
        const lastResultForCategory = allResults
          .filter(r => r.category === decodedCategory && !r.isTrial)
          .sort((a, b) => (b.timeTakenMinutes ?? 0) - (a.timeTakenMinutes ?? 0)) // Simplistic sort, needs a timestamp ideally
          .pop();
        if (lastResultForCategory) {
          resultToDisplay = lastResultForCategory;
        }
      }
    }
    
    setCurrentResult(resultToDisplay);

    if (resultToDisplay && currentExamConfig && currentExamConfig.questions.length > 0) {
        const performance: { [key: string]: { correct: number; total: number } } = {};
        resultToDisplay.answers.forEach(ans => {
            const question = currentExamConfig.questions.find(q => q.id === ans.questionId) as Question | undefined;
            if (question) {
                const topic = question.topic || "General";
                if (!performance[topic]) {
                    performance[topic] = { correct: 0, total: 0 };
                }
                performance[topic].total++;
                if (question.correctOptionIndex === ans.selectedOptionIndex) {
                    performance[topic].correct++;
                }
            }
        });
        setTopicPerformance(
            Object.entries(performance).map(([topic, data]) => ({
                topic,
                ...data,
                percentage: data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0,
            }))
        );
    } else if (resultToDisplay && !currentExamConfig && !resultToDisplay.isTrial) {
        // If results loaded from localStorage but no currentExamConfig (e.g. refresh on results page of a full exam)
        // We can't show topic performance without questions. Consider fetching questions if this is important.
        // For now, topic performance will be empty.
    }

    setIsLoading(false);
  }, [categoryFromUrl, examResult, currentExamConfig, isTrialFromState, getQuestionById]);

  if (isLoading) {
    return <LoadingSpinner text="Loading results..." className="mt-10"/>;
  }

  if (!currentResult) {
    return (
      <div className="text-center mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-yellow-700">No Exam Results Found</h2>
        <p className="text-textSecondary mt-2">
          We couldn't find the results for this exam. This might happen if you navigated here directly or the session expired. Please take an exam first.
        </p>
        <Link
          to="/exam-selection"
          className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Go to Exam Selection
        </Link>
      </div>
    );
  }
  // Ensure currentExamConfig is available for review, especially if result was from localStorage
  // This is a simplified approach. A real app might re-fetch questions if config is missing.
  const questionsForReview = currentExamConfig?.questions || [];


  const { scorePercent, correctAnswers, totalQuestions, passed, timeTakenMinutes, isTrial } = currentResult;

  const handleRetakeExam = () => {
    resetExam(); 
    navigate(`/exam/${encodeURIComponent(currentResult.category)}`, { state: { isTrial: currentResult.isTrial } });
  };


  return (
    <div className="max-w-4xl mx-auto">
      <header className={`p-8 rounded-xl shadow-xl text-center mb-8 ${passed && !isTrial ? 'bg-gradient-to-r from-green-500 to-accent' : (isTrial ? 'bg-gradient-to-r from-blue-500 to-primary-light' : 'bg-gradient-to-r from-red-500 to-red-700')} text-white`}>
        {passed && !isTrial ? <Award size={64} className="mx-auto mb-4" /> : (isTrial ? <CheckCircle size={64} className="mx-auto mb-4" /> : <XCircle size={64} className="mx-auto mb-4" />)}
        <h1 className="text-4xl font-bold mb-2">
          {isTrial ? 'Trial Exam Completed' : (passed ? 'Congratulations! You Passed!' : 'Exam Completed')}
        </h1>
        <p className="text-2xl opacity-90">{currentResult.category} Results</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-md text-center">
          <Percent size={32} className="text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-textPrimary">{scorePercent.toFixed(1)}%</h3>
          <p className="text-sm text-textSecondary">Your Score</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md text-center">
          <CheckCircle size={32} className="text-accent mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-textPrimary">{correctAnswers} / {totalQuestions}</h3>
          <p className="text-sm text-textSecondary">Correct Answers</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md text-center">
           <div className={`text-lg font-semibold ${passed || isTrial ? (passed ? 'text-accent' : 'text-blue-600') : 'text-red-500'}`}>{isTrial ? 'Trial Mode' : (passed ? 'Passed' : 'Failed')}</div>
           <p className="text-sm text-textSecondary">Status {isTrial ? '' : '(70% to pass)'}</p>
           {timeTakenMinutes && <p className="text-xs text-textSecondary mt-1">Time: {timeTakenMinutes} mins</p>}
        </div>
      </div>
      
      {topicPerformance.length > 0 && currentExamConfig && currentExamConfig.questions.length > 0 && (
        <div className="bg-card p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">Performance by Topic</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="topic" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="percentage" name="Correct" barSize={20}>
                        {topicPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.percentage >= 70 ? '#4CAF50' : (entry.percentage >= 50 ? '#FFB300' : '#F44336')} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        {questionsForReview.length > 0 && (
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
          >
            <ListChecks size={20} className="mr-2" /> {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
        )}
        <button
          onClick={handleRetakeExam}
          className="flex items-center justify-center px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors shadow-md"
        >
          <RefreshCw size={20} className="mr-2" /> {isTrial ? 'Retake Trial' : `Retake Full Exam (${currentResult.category})`}
        </button>
        {!isTrial && (
          <Link
            to="/exam-selection"
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            New Full Exam (Other Category)
          </Link>
        )}
         {isTrial && (
          <Link
            to="/dashboard"
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Back to Dashboard
          </Link>
        )}
      </div>

      {showReview && questionsForReview.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold text-textPrimary mb-4 border-b pb-2">Answer Review</h2>
          {questionsForReview.map((question, index) => {
            const userAnswer = currentResult.answers.find(ans => ans.questionId === question.id);
            return (
              <QuestionDisplay
                key={question.id}
                question={question}
                userAnswer={userAnswer}
                onAnswerSelect={() => {}} 
                questionNumber={index + 1}
                totalQuestions={totalQuestions}
                showExplanation={true}
              />
            );
          })}
        </div>
      )}

      {isTrial && <RegistrationCallToAction />}
    </div>
  );
};
