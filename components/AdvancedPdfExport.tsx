// components/AdvancedPdfExport.tsx
import React, { useState } from 'react';
import { FileDown, Settings, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { AdvancedPdfGenerator } from '../services/AdvancedPdfGenerator';
import { ExamResult, Question } from '../types';

interface PdfTemplate {
  name: string;
  coverStyle: 'corporate' | 'academic' | 'technical';
  includeCharts: boolean;
  includeFormulas: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

interface PdfGenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

interface AdvancedPdfExportProps {
  examResult: ExamResult;
  questions: Question[];
  className?: string;
}

export const AdvancedPdfExport: React.FC<AdvancedPdfExportProps> = ({
  examResult,
  questions,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<PdfGenerationProgress | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [template, setTemplate] = useState<PdfTemplate>({
    name: 'academic',
    coverStyle: 'academic',
    includeCharts: true,
    includeFormulas: true,
    detailLevel: 'comprehensive'
  });

  const handleGenerateAdvancedPdf = async () => {
    setIsGenerating(true);
    setStatus('idle');
    setErrorMessage('');
    setProgress(null);

    try {
      const pdfGenerator = new AdvancedPdfGenerator((progress) => {
        setProgress(progress);
      });

      const examData = {
        examResult,
        questions,
        userAnswers: examResult.answers
      };

      await pdfGenerator.generateAdvancedPdf(examData, template);
      
      setStatus('success');
      setProgress(null);
      setTimeout(() => setStatus('idle'), 5000);
      
    } catch (error) {
      console.error('Error generating advanced PDF:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al generar el PDF');
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const templatePresets = [
    {
      id: 'academic',
      name: 'Académico Universitario',
      description: 'Formato formal tipo tesis con análisis exhaustivo',
      template: {
        name: 'academic',
        coverStyle: 'academic' as const,
        includeCharts: true,
        includeFormulas: true,
        detailLevel: 'comprehensive' as const
      }
    },
    {
      id: 'corporate',
      name: 'Reporte Corporativo',
      description: 'Formato ejecutivo para presentaciones empresariales',
      template: {
        name: 'corporate',
        coverStyle: 'corporate' as const,
        includeCharts: true,
        includeFormulas: false,
        detailLevel: 'detailed' as const
      }
    },
    {
      id: 'technical',
      name: 'Manual Técnico',
      description: 'Documento técnico con énfasis en ingeniería',
      template: {
        name: 'technical',
        coverStyle: 'technical' as const,
        includeCharts: true,
        includeFormulas: true,
        detailLevel: 'comprehensive' as const
      }
    },
    {
      id: 'basic',
      name: 'Resumen Básico',
      description: 'Reporte conciso con información esencial',
      template: {
        name: 'basic',
        coverStyle: 'academic' as const,
        includeCharts: false,
        includeFormulas: false,
        detailLevel: 'basic' as const
      }
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerateAdvancedPdf}
          disabled={isGenerating}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Generando...
            </>
          ) : status === 'success' ? (
            <>
              <Check size={20} className="mr-2" />
              PDF Generado
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle size={20} className="mr-2" />
              Error
            </>
          ) : (
            <>
              <FileDown size={20} className="mr-2" />
              PDF Avanzado
            </>
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          title="Configurar plantilla del PDF"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Barra de progreso */}
      {progress && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">{progress.stage}</span>
            <span className="text-sm text-blue-600">{progress.progress.toFixed(0)}%</span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-blue-700">{progress.message}</p>
        </div>
      )}

      {/* Mensajes de estado */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
          <AlertCircle size={16} className="inline mr-1" />
          {errorMessage}
        </div>
      )}

      {status === 'success' && (
        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-md text-green-700 text-sm">
          <Check size={16} className="inline mr-1" />
          PDF avanzado descargado exitosamente
        </div>
      )}

      {/* Panel de configuración */}
      {showSettings && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configurar PDF</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Plantillas predefinidas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plantillas Predefinidas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templatePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setTemplate(preset.template)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    template.name === preset.template.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuración personalizada */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900">Configuración Personalizada</h4>
            
            {/* Estilo de portada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilo de Portada
              </label>
              <select
                value={template.coverStyle}
                onChange={(e) => setTemplate(prev => ({
                  ...prev,
                  coverStyle: e.target.value as 'corporate' | 'academic' | 'technical'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="academic">Académico</option>
                <option value="corporate">Corporativo</option>
                <option value="technical">Técnico</option>
              </select>
            </div>

            {/* Nivel de detalle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Detalle IA
              </label>
              <select
                value={template.detailLevel}
                onChange={(e) => setTemplate(prev => ({
                  ...prev,
                  detailLevel: e.target.value as 'basic' | 'detailed' | 'comprehensive'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Básico</option>
                <option value="detailed">Detallado</option>
                <option value="comprehensive">Exhaustivo</option>
              </select>
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={template.includeCharts}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Incluir gráficos y visualizaciones</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={template.includeFormulas}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    includeFormulas: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Incluir fórmulas técnicas</span>
              </label>
            </div>
          </div>

          {/* Información sobre características */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Características del PDF Avanzado:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Portada profesional personalizable</li>
              <li>• Índice de contenidos automático</li>
              <li>• Análisis estadístico con gráficos</li>
              <li>• Información técnica enriquecida con IA</li>
              <li>• Plan de estudio personalizado de 4 semanas</li>
              <li>• Fórmulas y referencias técnicas por categoría</li>
              <li>• Certificado de participación (si aprobó)</li>
              <li>• Bibliografía especializada</li>
            </ul>
          </div>

          {/* Estimación de tiempo */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              <strong>Tiempo estimado:</strong> 30-60 segundos para generar el PDF completo.
              El tiempo puede variar según el número de preguntas y la configuración de IA.
            </p>
          </div>
        </div>
      )}

      {/* Información básica del PDF */}
      <div className="mt-4 text-xs text-gray-500 max-w-md">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
            <FileDown size={12} className="text-white" />
          </div>
          <span className="font-medium">PDF Técnico Avanzado</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-gray-400">
          <div>✓ Análisis IA detallado</div>
          <div>✓ Plan de estudio 4 semanas</div>
          <div>✓ Certificado incluido</div>
          <div>✓ Formato universitario</div>
        </div>
      </div>
    </div>
  );
};