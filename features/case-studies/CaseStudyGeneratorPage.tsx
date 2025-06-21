
import React, { useState, useEffect } from 'react';
import { generateCaseStudy } from '../../services/geminiService';
import { CaseStudyData } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MarkdownDisplay } from '../../components/MarkdownDisplay';
import { Brain, Lightbulb, AlertTriangle, FileText, CheckSquare,ClipboardList, ChevronDown } from 'lucide-react'; // Added ChevronDown

// Sub-component for displaying a section of the case study
const CaseStudySection: React.FC<{ title: string; content: string; icon: React.ReactNode; defaultOpen?: boolean }> = ({ title, content, icon, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content && !defaultOpen && title !== "Case Study Scenario" && title !== "Assignment") { // Only hide if not one of the always-shown-header sections
     // If content is empty and it's not a critical section that should always show its header (like Scenario/Assignment)
     // and it's not meant to be defaultOpen, then don't render it at all.
     // This helps hide optional sections like Rubric/Answers if AI doesn't return them.
     // However, the service layer should ideally throw an error if critical parts are missing.
     // For now, this provides a graceful fallback in UI.
  }


  return (
    <div className="mb-6 bg-card p-6 rounded-xl shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-xl font-semibold text-primary hover:text-primary-dark transition-colors"
      >
        <span className="flex items-center">
          {icon}
          <span className="ml-3">{title}</span>
        </span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={24} />
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 prose prose-indigo max-w-none text-textPrimary">
          {content ? <MarkdownDisplay content={content} /> : <p className="text-textSecondary italic">No content generated for this section, or section is optional and was not returned by the AI.</p>}
        </div>
      )}
    </div>
  );
};


export const CaseStudyGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [caseStudy, setCaseStudy] = useState<CaseStudyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;
    if (!key) {
      setIsApiKeyMissing(true);
    } else {
      setIsApiKeyMissing(false);
    }
  }, []); // Re-check on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic for the case study.');
      return;
    }
    
    // Re-check API key just before submission as well
    const key = localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;
    if (!key) {
      setIsApiKeyMissing(true); // Update state if key was removed after page load
      setError('Gemini API Key is missing. Please set it using the "API Key" button in the header.');
      return;
    }
    setIsApiKeyMissing(false); // Key exists

    setIsLoading(true);
    setError(null);
    setCaseStudy(null);

    try {
      const result = await generateCaseStudy(topic);
      setCaseStudy(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while generating the case study.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <Brain className="w-20 h-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-textPrimary">AI-Generated Case Studies</h1>
        <p className="text-lg text-textSecondary mt-2">
          Enter a vibration analysis topic, and our AI will generate a relevant case study, assignment, grading rubric, and detailed answers to enhance your practical understanding.
        </p>
      </header>

      {isApiKeyMissing && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-5 w-5 text-red-500 mr-3" /></div>
            <div>
              <p className="font-bold">API Key Required</p>
              <p className="text-sm">A Gemini API Key is required to generate case studies. Please click the "API Key" button in the header to set your key.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-10 bg-card p-6 rounded-xl shadow-lg">
        <label htmlFor="topic" className="block text-md font-medium text-textPrimary mb-2">
          Vibration Analysis Topic:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Bearing Fault Analysis, Unbalance in Fans, Misalignment in Pumps"
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading} // Removed isApiKeyMissing from here, button is better place
          />
          <button
            type="submit"
            disabled={isLoading || isApiKeyMissing}
            className="px-8 py-3 bg-secondary hover:bg-secondary-dark text-white font-semibold rounded-lg transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size={20} className="p-0 mr-2 inline-block"/> : <Lightbulb size={20} className="mr-2"/>}
            Generate Case Study
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg shadow-md">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {isLoading && <LoadingSpinner text="Generating your case study, this may take a moment..." />}

      {caseStudy && !isLoading && (
        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-textPrimary mb-6 pb-2 border-b-2 border-primary">
            Generated Case Study: <span className="text-primary">{caseStudy.topic}</span>
          </h2>
          <CaseStudySection title="Case Study Scenario" content={caseStudy.caseStudyText} icon={<FileText size={24} />} defaultOpen={true} />
          <CaseStudySection title="Assignment" content={caseStudy.assignment} icon={<CheckSquare size={24} />} defaultOpen={true} />
          <CaseStudySection title="Grading Rubric" content={caseStudy.gradingRubric} icon={<ClipboardList size={24} />} defaultOpen={!(!caseStudy.gradingRubric)} />
          <CaseStudySection title="Answer Sheet & Explanations" content={caseStudy.answerSheet} icon={<Lightbulb size={24} />} defaultOpen={!(!caseStudy.answerSheet)} />
        </div>
      )}
    </div>
  );
};