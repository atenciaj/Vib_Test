// services/pdfGenerator.ts
import { generateTechnicalAnalysis } from './aiAnalysisService';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  topic: string;
}

interface ExamResultItem {
  question: Question;
  isCorrect: boolean;
  userAnswer: number;
  questionId: string;
}

interface ExamReportData {
  examResults: ExamResultItem[];
  examInfo: {
    category: string;
    date: string;
    duration: number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  };
}

export const generateExamReportWithAI = async (reportData: ExamReportData): Promise<Blob> => {
  console.log("🚀 Iniciando generación de reporte con análisis IA...");
  
  // Filtrar solo preguntas incorrectas para análisis
  const incorrectQuestions = reportData.examResults.filter(result => !result.isCorrect);
  
  console.log(`🔍 Generando análisis para ${incorrectQuestions.length} preguntas incorrectas...`);
  
  // Generar análisis IA para preguntas incorrectas
  const questionsWithAnalysis = await Promise.all(
    reportData.examResults.map(async (result, index) => {
      if (!result.isCorrect) {
        try {
          console.log(`🤖 Analizando pregunta ${index + 1}: ${result.question.text.substring(0, 50)}...`);
          
          const analysis = await generateTechnicalAnalysis({
            question: result.question.text,
            options: result.question.options,
            correctAnswer: result.question.options[result.question.correctOptionIndex],
            correctIndex: result.question.correctOptionIndex,
            topic: result.question.topic,
            category: reportData.examInfo.category
          });
          
          return {
            ...result,
            aiAnalysis: analysis
          };
        } catch (error) {
          console.error(`❌ Error generando análisis para pregunta ${index + 1}:`, error);
          return {
            ...result,
            aiAnalysis: `**Error al generar análisis técnico**\n\nNo se pudo generar el análisis automático para esta pregunta. Posibles causas:\n- Configuración de API Key\n- Límites de rate de la API\n- Error de conectividad\n\nPor favor revise la configuración y vuelva a intentar.`
          };
        }
      }
      return result;
    })
  );

  console.log("📄 Análisis completados, generando documento PDF...");
  
  // Generar el HTML del reporte
  const htmlContent = generateReportHTML(reportData, questionsWithAnalysis);
  
  // Generar PDF
  return await generatePDFFromHTML(htmlContent);
};

const generateReportHTML = (reportData: ExamReportData, questionsWithAnalysis: any[]): string => {
  const { examInfo } = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Técnico de Análisis de Vibraciones - IA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
            background-color: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 30px;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 40px -20px;
            padding: 40px 20px 30px 20px;
        }
        .header h1 {
            font-size: 2.2em;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .header h2 {
            font-size: 1.4em;
            margin: 5px 0;
            opacity: 0.9;
        }
        .ai-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 15px;
            font-size: 0.9em;
        }
        .summary {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary h3 {
            color: #495057;
            margin-top: 0;
            font-size: 1.3em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .question-container {
            margin-bottom: 40px;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
        }
        .question-header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 20px;
            font-weight: bold;
            font-size: 1.1em;
        }
        .question-content {
            padding: 25px;
        }
        .question-text {
            font-size: 16px;
            margin-bottom: 20px;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1.5;
        }
        .options-list {
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .option {
            margin: 10px 0;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #dee2e6;
            background: white;
        }
        .option.correct {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border-color: #28a745;
            border-width: 2px;
            font-weight: 600;
        }
        .option.correct::before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
        }
        .ai-analysis {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border: 2px solid #2196f3;
            border-radius: 12px;
            padding: 25px;
            margin-top: 25px;
            position: relative;
        }
        .ai-analysis::before {
            content: "🤖";
            position: absolute;
            top: -10px;
            left: 20px;
            background: #2196f3;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
        }
        .ai-analysis h4 {
            color: #1976d2;
            margin: 0 0 15px 30px;
            font-size: 1.2em;
            font-weight: bold;
        }
        .ai-analysis-content {
            font-size: 14px;
            line-height: 1.7;
            color: #1565c0;
            white-space: pre-wrap;
            word-wrap: break-word;
            background: rgba(255,255,255,0.7);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔬 Vib-Test</h1>
        <h2>Reporte Técnico de Análisis de Vibraciones</h2>
        <h2>${examInfo.category}</h2>
        <p>Fecha: ${examInfo.date}</p>
        <div class="ai-badge">
            🤖 Análisis Técnico Generado por Inteligencia Artificial
        </div>
        <p style="margin-top: 15px; font-size: 0.9em;">
            Conforme a la norma ISO 18436-2 para análisis de vibraciones
        </p>
    </div>

    <div class="summary">
        <h3>📊 Resumen Ejecutivo</h3>
        <p><strong>Puntuación:</strong> ${examInfo.score.toFixed(1)}%</p>
        <p><strong>Resultado:</strong> ${examInfo.correctAnswers}/${examInfo.totalQuestions} preguntas correctas</p>
        <p><strong>Estado:</strong> ${examInfo.score >= 70 ? '✅ APROBADO' : '❌ REQUIERE MEJORA'}</p>
        <p><strong>Duración:</strong> ${examInfo.duration} minutos</p>
        ${examInfo.score < 70 ? '<p><strong>📚 Recomendación:</strong> Revisar las áreas de mejora identificadas en el análisis técnico detallado generado por IA.</p>' : ''}
    </div>

    ${questionsWithAnalysis.map((result, index) => {
      if (result.isCorrect) return '';
      
      return `
        <div class="question-container">
            <div class="question-header">
                ❌ Pregunta ${index + 1} - INCORRECTA
                <div style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">
                    📁 Área: ${result.question.topic}
                </div>
            </div>
            
            <div class="question-content">
                <div class="question-text">
                    ${result.question.text}
                </div>
                
                <div class="options-list">
                    <strong>📋 Opciones de Respuesta:</strong>
                    ${result.question.options.map((option, optIndex) => `
                        <div class="option ${optIndex === result.question.correctOptionIndex ? 'correct' : ''}">
                            ${String.fromCharCode(65 + optIndex)}. ${option}
                        </div>
                    `).join('')}
                </div>
                
                ${result.aiAnalysis ? `
                    <div class="ai-analysis">
                        <h4>Análisis Técnico Detallado</h4>
                        <div class="ai-analysis-content">${result.aiAnalysis}</div>
                    </div>
                ` : ''}
            </div>
        </div>
      `;
    }).join('')}

    <div class="footer">
        <div style="font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px;">🔬 Vib-Test</div>
        <p>Generado el ${new Date().toLocaleString()}</p>
        <p>Análisis técnico generado por IA basado en ISO 18436-2</p>
        <p>© 2025 Vib-Test - Plataforma de Preparación para Analistas de Vibraciones</p>
    </div>
</body>
</html>
  `;
};

const generatePDFFromHTML = async (htmlContent: string): Promise<Blob> => {
  try {
    console.log("📄 Iniciando generación de PDF...");
    
    // Importaciones dinámicas para evitar problemas de SSR
    const jsPDF = (await import('jspdf')).jsPDF;
    const html2canvas = (await import('html2canvas')).default;
    
    // Crear elemento temporal en el DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Estilos para el elemento temporal
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px'; // Ancho A4 en píxeles (210mm * 3.78)
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#333';
    
    // Agregar al DOM temporalmente
    document.body.appendChild(tempDiv);
    
    console.log("🖼️ Convirtiendo HTML a imagen...");
    
    // Convertir HTML a canvas con alta calidad
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Mayor resolución para mejor calidad
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: tempDiv.scrollWidth,
      windowHeight: tempDiv.scrollHeight
    });
    
    // Limpiar elemento temporal del DOM
    document.body.removeChild(tempDiv);
    
    console.log("📋 Creando documento PDF...");
    
    // Crear nuevo documento PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Calcular dimensiones
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const marginTop = 0;
    
    let heightLeft = imgHeight;
    let position = marginTop;
    
    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
    
    // Agregar páginas adicionales si el contenido es muy largo
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + marginTop;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }
    
    console.log("✅ PDF generado exitosamente");
    
    // Retornar el PDF como blob
    return pdf.output('blob');
    
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    
    // Fallback: retornar HTML como blob para debugging
    alert(`Error generando PDF: ${error.message}\n\nSe descargará como HTML para revisión.`);
    return new Blob([htmlContent], { 
      type: 'text/html' 
    });
  }
};
