import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useExam } from '../../contexts/ExamContext';
import { QuestionDisplay } from './QuestionDisplay';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AlertTriangle, Award, RefreshCw, ListChecks, CheckCircle, XCircle, Percent, BookOpen as BookOpenIcon, FileDown, Brain, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Question, ExamCategory, ExamResult as ExamResultType } from '../../types';
// NUEVO: Importaciones de los componentes PDF
import { PdfExportButton } from '../../components/PdfExportButton';
import { AdvancedPdfExport } from '../../components/AdvancedPdfExport';
// NUEVO: Importaciones para IA
import { generateExamReportWithAI } from '../../services/pdfGenerator';
import { checkApiKeyConfiguration } from '../../services/aiAnalysisService';

interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

// NUEVO: Componente para configurar API Key
const ApiKeySetup: React.FC<{ onClose: () => void; onApiKeySet: () => void }> = ({ onClose, onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      alert('✅ API Key guardada correctamente');
      onApiKeySet();
      onClose();
    } else {
      alert('❌ Por favor ingrese una API Key válida');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h3>🔑 Configurar API Key de Gemini</h3>
        <p>Para generar análisis técnico con IA, necesita configurar su API Key de Google Gemini.</p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            API Key:
          </label>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingrese su API Key de Gemini"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            {showKey ? '🙈 Ocultar' : '👁️ Mostrar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 Guardar
          </button>
          <button
            onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
            style={{
              flex: 1,
              padding: '12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔗 Obtener API Key
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Nota:</strong> Su API Key se guarda localmente en su navegador y no se comparte con nuestros servidores.
        </div>
      </div>
    </div>
  );
};

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
  
  // NUEVO: Estados para IA
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReportProgress, setAiReportProgress] = useState('');
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const isTrialFromState = location.state?.isTrial === true;

  // NUEVO: Verificar API Key al cargar
  useEffect(() => {
    setHasApiKey(checkApiKeyConfiguration());
  }, []);

  useEffect(() => {
    const decodedCategory = decodeURIComponent(categoryFromUrl || '') as ExamCategory;
    let resultToDisplay: ExamResultType | null = null;

    // Prefer result from context if available and matches category and trial status
    if (examResult && examResult.category === decodedCategory && examResult.isTrial === isTrialFromState) {
      resultToDisplay = examResult;
    } else {
      // Fallback to localStorage if context result is not matching (e.g., page refresh)
      const allResults = JSON.parse(localStorage.getItem('vibTestResults') || '[]') as ExamResultType[];
      if (!isTrialFromState) {
        const lastResultForCategory = allResults
          .filter(r => r.category === decodedCategory && !r.isTrial)
          .sort((a, b) => (b.timeTakenMinutes ?? 0) - (a.timeTakenMinutes ?? 0))
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
    }

    setIsLoading(false);
  }, [categoryFromUrl, examResult, currentExamConfig, isTrialFromState, getQuestionById]);

  // NUEVO: Función para generar reporte con IA
  const handleGenerateAIReport = async () => {
    if (!hasApiKey) {
      setShowApiKeySetup(true);
      return;
    }

    if (!currentResult || !questionsForReview.length) {
      alert('No hay datos suficientes para generar el reporte');
      return;
    }

    try {
      setIsGeneratingAIReport(true);
      setAiReportProgress('Preparando datos del examen...');

      // Preparar datos para el reporte
      const incorrectQuestions = questionsForReview.filter(q => {
        const userAnswer = currentResult.answers.find(ans => ans.questionId === q.id);
        return userAnswer && userAnswer.selectedOptionIndex !== q.correctOptionIndex;
      });

      setAiReportProgress(`🤖 Generando análisis técnico con IA para ${incorrectQuestions.length} preguntas...`);
      
      const reportData = {
        examResults: questionsForReview.map(q => {
          const userAnswer = currentResult.answers.find(ans => ans.questionId === q.id);
          return {
            question: q,
            isCorrect: userAnswer ? userAnswer.selectedOptionIndex === q.correctOptionIndex : false,
            userAnswer: userAnswer?.selectedOptionIndex ?? -1,
            questionId: q.id
          };
        }),
        examInfo: {
          category: currentResult.category,
          date: new Date().toLocaleDateString(),
          duration: currentResult.timeTakenMinutes || 0,
          score: currentResult.scorePercent,
          totalQuestions: currentResult.totalQuestions,
          correctAnswers: currentResult.correctAnswers
        }
      };

      setAiReportProgress('📄 Generando documento PDF...');
      
      const pdfBlob = await generateExamReportWithAI(reportData);
      
      setAiReportProgress('💾 Descargando reporte...');

      // Descargar automáticamente
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-vibraciones-ia-${currentResult.category}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAiReportProgress('✅ ¡Reporte generado exitosamente!');
      
    } catch (error) {
      console.error('Error generando reporte con IA:', error);
      setAiReportProgress('❌ Error generando reporte');
      alert(`Error: ${error.message}\n\nVerifique:\n1. API Key configurada\n2. Conexión a internet\n3. Consola para más detalles`);
    } finally {
      setTimeout(() => {
        setIsGeneratingAIReport(false);
        setAiReportProgress('');
      }, 3000);
    }
  };

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

  const questionsForReview = currentExamConfig?.questions || [];
  const { scorePercent, correctAnswers, totalQuestions, passed, timeTakenMinutes, isTrial } = currentResult;
  const incorrectCount = questionsForReview.filter(q => {
    const userAnswer = currentResult.answers.find(ans => ans.questionId === q.id);
    return userAnswer && userAnswer.selectedOptionIndex !== q.correctOptionIndex;
  }).length;

  const handleRetakeExam = () => {
    resetExam(); 
    navigate(`/exam/${encodeURIComponent(currentResult.category)}`, { state: { isTrial: currentResult.isTrial } });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Modal de configuración de API Key */}
      {showApiKeySetup && (
        <ApiKeySetup
          onClose={() => setShowApiKeySetup(false)}
          onApiKeySet={() => {
            setHasApiKey(true);
            setShowApiKeySetup(false);
          }}
        />
      )}

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

      {/* NUEVA SECCIÓN: Análisis Técnico con IA */}
      {questionsForReview.length > 0 && incorrectCount > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Brain size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                🤖 Análisis Técnico Inteligente
              </h3>
              <p className="text-purple-700 mb-3">
                Genera análisis técnico detallado con IA para las <strong>{incorrectCount}</strong> preguntas incorrectas, 
                incluyendo fundamentos ISO 18436-2 y aplicaciones prácticas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <button
                  onClick={handleGenerateAIReport}
                  disabled={isGeneratingAIReport}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md min-w-[200px] ${
                    isGeneratingAIReport
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  }`}
                >
                  {isGeneratingAIReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Brain size={18} className="mr-2" />
                      Generar Análisis IA
                    </>
                  )}
                </button>

                {!hasApiKey && (
                  <button
                    onClick={() => setShowApiKeySetup(true)}
                    className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Settings size={16} className="mr-2" />
                    Configurar API Key
                  </button>
                )}
              </div>

              {aiReportProgress && (
                <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded">
                  <p className="text-blue-800 font-medium">{aiReportProgress}</p>
                  {isGeneratingAIReport && (
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-xs text-purple-600">
                  <strong>Incluye:</strong> Fundamentos técnicos, análisis de opciones incorrectas, 
                  aplicaciones prácticas, conceptos clave y recomendaciones personalizadas de estudio.
                  {!hasApiKey && <strong className="text-orange-600"> (Requiere API Key de Gemini)</strong>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN INFORMATIVA SOBRE PDF EXISTENTE */}
      {questionsForReview.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <FileDown size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Reporte PDF Estándar
              </h3>
              <p className="text-blue-700 mb-3">
                Genera un documento profesional que incluye:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Portada con logo y resultados principales
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Resumen ejecutivo del rendimiento
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Lista de preguntas y respuestas correctas
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Plan de mejora basado en áreas débiles
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE BOTONES ACTUALIZADA */}
      <div className="flex flex-col lg:flex-row justify-center gap-4 mb-8">
        {questionsForReview.length > 0 && (
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
          >
            <ListChecks size={20} className="mr-2" /> {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
        )}
        
        {/* Botones de PDF existentes */}
        {questionsForReview.length > 0 && (
          <div className="flex flex-col gap-3">
            <PdfExportButton
              examResult={currentResult}
              questions={questionsForReview}
              variant="secondary"
              className="min-w-[200px]"
            />
            <AdvancedPdfExport
              examResult={currentResult}
              questions={questionsForReview}
              className="min-w-[200px]"
            />
          </div>
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