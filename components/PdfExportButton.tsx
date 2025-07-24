// components/PdfExportButton.tsx
import React, { useState } from 'react';
import { FileDown, Loader2, AlertCircle, Check } from 'lucide-react';
import { AdvancedPdfGenerator } from '../services/AdvancedPdfGenerator';
import { ExamResult, Question } from '../types';

interface PdfExportButtonProps {
  examResult: ExamResult;
  questions: Question[];
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  examResult,
  questions,
  className = '',
  variant = 'primary'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
      case 'secondary':
        return `${baseStyles} bg-gray-600 text-white hover:bg-gray-700`;
      case 'outline':
        return `${baseStyles} border-2 border-blue-600 text-blue-600 hover:bg-blue-50`;
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
    }
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const pdfService = new AdvancedPdfGenerator();
      
      const examData = {
        examResult,
        questions,
        userAnswers: examResult.answers
      };

      await pdfService.generateExamPdf(examData);
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000); // Reset status after 3 seconds
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonContent = () => {
    if (isGenerating) {
      return (
        <>
          <Loader2 size={20} className="mr-2 animate-spin" />
          Generando PDF...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <Check size={20} className="mr-2" />
          PDF Generado
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle size={20} className="mr-2" />
          Error
        </>
      );
    }

    return (
      <>
        <FileDown size={20} className="mr-2" />
        Exportar Reporte PDF
      </>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleGeneratePdf}
        disabled={isGenerating}
        className={`${getButtonStyles()} ${className}`}
        title="Generar reporte PDF con análisis técnico detallado"
      >
        {getButtonContent()}
      </button>
      
      {status === 'error' && errorMessage && (
        <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm max-w-md text-center">
          <AlertCircle size={16} className="inline mr-1" />
          {errorMessage}
        </div>
      )}
      
      {status === 'success' && (
        <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded-md text-green-700 text-sm max-w-md text-center">
          <Check size={16} className="inline mr-1" />
          PDF descargado exitosamente
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500 text-center max-w-md">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <FileDown size={14} className="text-blue-600" />
          </div>
          <span className="font-medium">Reporte Técnico Completo</span>
        </div>
        <ul className="text-left space-y-1">
          <li>• Análisis detallado con IA de cada pregunta</li>
          <li>• Información técnica complementaria</li>
          <li>• Formato profesional tipo presentación universitaria</li>
        </ul>
      </div>
    </div>
  );
};