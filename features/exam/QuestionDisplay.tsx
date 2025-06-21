
import React from 'react';
import { Question, UserAnswer } from '../../types';
import { Image } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  userAnswer: UserAnswer | undefined;
  onAnswerSelect: (optionIndex: number) => void;
  questionNumber: number;
  totalQuestions: number;
  showExplanation?: boolean; // For review mode
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  userAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
  showExplanation = false,
}) => {
  const isCorrect = userAnswer?.selectedOptionIndex === question.correctOptionIndex;

  return (
    <div className="bg-card p-6 rounded-lg shadow-md mb-6">
      <p className="text-sm text-textSecondary mb-1">
        Question {questionNumber} of {totalQuestions} (Topic: {question.topic || 'General'})
      </p>
      <h2 className="text-lg font-semibold text-textPrimary mb-4">{question.text}</h2>

      {question.image && (
        <div className="my-4 border rounded-md p-2 bg-gray-50 flex justify-center items-center">
            <img src={question.image} alt="Question illustration" className="max-w-full h-auto max-h-64 object-contain rounded" />
        </div>
      )}

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = userAnswer?.selectedOptionIndex === index;
          let optionStyle = 'bg-gray-100 hover:bg-gray-200 text-textPrimary';
          if (showExplanation) {
            if (index === question.correctOptionIndex) {
              optionStyle = 'bg-green-100 border-green-500 text-green-700 font-semibold';
            } else if (isSelected && index !== question.correctOptionIndex) {
              optionStyle = 'bg-red-100 border-red-500 text-red-700';
            } else {
              optionStyle = 'bg-gray-50 text-textSecondary';
            }
          } else if (isSelected) {
            optionStyle = 'bg-primary-light text-white ring-2 ring-primary';
          }

          return (
            <button
              key={index}
              onClick={() => !showExplanation && onAnswerSelect(index)}
              disabled={showExplanation}
              className={`w-full text-left p-3 border rounded-md transition-colors duration-150 ${optionStyle} ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`text-md font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
            {!isCorrect && userAnswer?.selectedOptionIndex !== null && (
                <span> Your answer: {question.options[userAnswer!.selectedOptionIndex!]}</span>
            )}
            {!isCorrect && userAnswer?.selectedOptionIndex === null && (
                <span> You did not answer this question.</span>
            )}
          </h3>
          <p className="text-sm text-textSecondary mt-1">
            <strong>Correct Answer:</strong> {question.options[question.correctOptionIndex]}
          </p>
          <p className="text-sm text-textSecondary mt-2">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};