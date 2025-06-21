
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamCategory } from '../../types';
import { useExam } from '../../contexts/ExamContext';
import { DEFAULT_EXAM_CONFIG } from '../../constants';
import { ListChecks, Clock, Target, CheckCircle, ArrowRightCircle } from 'lucide-react';

export const ExamSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { startExam, resetExam } = useExam();

  const handleSelectCategory = (category: ExamCategory) => {
    resetExam(); // Reset any previous exam state
    startExam(category);
    navigate(`/exam/${encodeURIComponent(category)}`);
  };

  const categories = Object.values(ExamCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <ListChecks className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-textPrimary">Select Exam Category</h1>
        <p className="text-lg text-textSecondary mt-2">
          Choose a certification category to start your simulated exam. Each category aligns with ISO 18436-2 standards.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => {
          const config = DEFAULT_EXAM_CONFIG[category];
          return (
            <div
              key={category}
              className="bg-card rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-3">{category}</h2>
                <div className="space-y-2 text-sm text-textSecondary mb-4">
                  <div className="flex items-center">
                    <ListChecks size={18} className="mr-2 text-primary-light" />
                    <span>{config.questions} multiple-choice questions</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-primary-light" />
                    <span>{config.duration} minutes duration</span>
                  </div>
                  <div className="flex items-center">
                    <Target size={18} className="mr-2 text-primary-light" />
                    <span>70% passing grade</span>
                  </div>
                </div>
                <p className="text-xs text-textSecondary mb-4 italic">
                  Focuses on topics relevant to {category} Vibration Analyst certification.
                </p>
              </div>
              <button
                onClick={() => handleSelectCategory(category)}
                className="w-full mt-4 bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center group"
              >
                Start {category} Exam
                <ArrowRightCircle size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          );
        })}
      </div>
       <div className="mt-12 p-6 bg-blue-50 border-l-4 border-primary rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-primary">Exam Preparation Tip</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Ensure you understand the Body of Knowledge for your chosen category. Our questions are designed to test practical application of these concepts. Good luck!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};