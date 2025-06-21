
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExamResult, ExamCategory, ChartDataPoint } from '../../types';
import { Activity, BookOpen, Brain, ListChecks, Award, ChevronDown, ChevronRight as ChevronRightIcon, PlayCircle } from 'lucide-react'; // Added PlayCircle
import { ALL_TOPICS_BY_CATEGORY, TRIAL_QUESTION_COUNT } from '../../constants';

export const DashboardPage: React.FC = () => {
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    examsTaken: 0,
    averageScore: 0,
    bestScore: 0,
    categoriesAttempted: new Set<ExamCategory>(),
  });
  const navigate = useNavigate();

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('vibTestResults') || '[]') as ExamResult[];
    setExamHistory(results.filter(r => !r.isTrial)); // Filter out trial exams from history stats

    if (results.length > 0) {
      const nonTrialResults = results.filter(r => !r.isTrial);
      if (nonTrialResults.length > 0) {
        const totalScore = nonTrialResults.reduce((sum, r) => sum + r.scorePercent, 0);
        const best = nonTrialResults.reduce((max, r) => (r.scorePercent > max ? r.scorePercent : max), 0);
        const categories = new Set(nonTrialResults.map(r => r.category));
        setSummaryStats({
          examsTaken: nonTrialResults.length,
          averageScore: parseFloat((totalScore / nonTrialResults.length).toFixed(1)),
          bestScore: parseFloat(best.toFixed(1)),
          categoriesAttempted: categories,
        });
      }
    }
  }, []);

  const chartData: ChartDataPoint[] = Object.values(ExamCategory).map(cat => {
    const catResults = examHistory.filter(r => r.category === cat && !r.isTrial);
    const avgScore = catResults.length > 0 
      ? catResults.reduce((sum, r) => sum + r.scorePercent, 0) / catResults.length
      : 0;
    return { name: cat.replace("Category ", "Cat "), value: parseFloat(avgScore.toFixed(1)) };
  });

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-card p-6 rounded-xl shadow-lg flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
      <div className="p-3 bg-primary-light rounded-full text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm text-textSecondary">{title}</p>
        <p className="text-2xl font-semibold text-textPrimary">{value}</p>
      </div>
    </div>
  );

  const handleStartTrialExam = (category: ExamCategory) => {
    navigate(`/exam/${encodeURIComponent(category)}`, { state: { isTrial: true } });
  };

  return (
    <div className="space-y-8">
      <header className="bg-card p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Vib-Test Dashboard</h1>
        <p className="text-textSecondary">Your central hub for tracking progress and accessing study tools for Vibration Analyst certification.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Exams Taken" value={summaryStats.examsTaken} icon={<ListChecks size={24} />} />
        <StatCard title="Average Score" value={`${summaryStats.averageScore}%`} icon={<Activity size={24} />} />
        <StatCard title="Best Score" value={`${summaryStats.bestScore}%`} icon={<Award size={24} />} />
        <StatCard title="Categories Attempted" value={summaryStats.categoriesAttempted.size} icon={<BookOpen size={24} />} />
      </section>

      <section className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">Quick Trial Exams ({TRIAL_QUESTION_COUNT} Questions)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(ExamCategory).map(category => (
            <button
              key={category}
              onClick={() => handleStartTrialExam(category)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 shadow-md"
            >
              <PlayCircle size={20} className="mr-2" />
              Start {category} Trial
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">Average Score by Category (Full Exams)</h2>
          {examHistory.filter(r => !r.isTrial).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#757575" />
                <YAxis unit="%" stroke="#757575" domain={[0, 100]} />
                <Tooltip wrapperClassName="rounded-md shadow-lg" cursor={{ fill: 'rgba(25, 118, 210, 0.1)' }}/>
                <Legend />
                <Bar dataKey="value" name="Avg Score" fill="#1976D2" barSize={30} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-textSecondary text-center py-10">No full exam data yet. Take an exam to see your progress!</p>
          )}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/exam-selection" className="block w-full text-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-md">
              Start New Full Exam
            </Link>
            <Link to="/case-studies" className="block w-full text-center px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors duration-150 shadow-md">
              Generate Case Study
            </Link>
            <Link to="/resources" className="block w-full text-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-green-600 transition-colors duration-150 shadow-md">
              View Resources
            </Link>
          </div>
        </div>
      </section>
      
      <section className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">ISO 18436-2 Categories & Topics Overview</h2>
        <div className="space-y-4">
          {Object.values(ExamCategory).map(category => (
            <details key={category} className="group bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <summary className="font-semibold text-primary-dark cursor-pointer flex justify-between items-center">
                {category}
                <ChevronRightIcon className="w-5 h-5 group-open:hidden" />
                <ChevronDown className="w-5 h-5 hidden group-open:block" />
              </summary>
              <ul className="list-disc list-inside mt-2 ml-4 text-sm text-textSecondary space-y-1">
                {(ALL_TOPICS_BY_CATEGORY[category] || []).map(topic => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {examHistory.filter(r => !r.isTrial).length > 0 && (
        <section className="bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary mb-4">Recent Full Exam History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-sm font-semibold text-textSecondary">Category</th>
                  <th className="py-2 px-3 text-sm font-semibold text-textSecondary">Score</th>
                  <th className="py-2 px-3 text-sm font-semibold text-textSecondary">Passed</th>
                  <th className="py-2 px-3 text-sm font-semibold text-textSecondary">Date (Approx)</th>
                </tr>
              </thead>
              <tbody>
                {examHistory.filter(r => !r.isTrial).slice(-5).reverse().map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm text-textPrimary">{result.category}</td>
                    <td className="py-3 px-3 text-sm text-textPrimary">{result.scorePercent.toFixed(1)}%</td>
                    <td className={`py-3 px-3 text-sm font-medium ${result.passed ? 'text-accent' : 'text-red-500'}`}>
                      {result.passed ? 'Yes' : 'No'}
                    </td>
                    <td className="py-3 px-3 text-sm text-textSecondary">Recently</td> {/* Date not stored currently */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
