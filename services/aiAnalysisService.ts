import { GOOGLE_AI_API_KEY } from "../constants";
// services/aiAnalysisService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_MODEL_TEXT } from '../constants';

interface QuestionAnalysisData {
  question: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  topic: string;
  category: string;
}

// NUEVA FUNCIÓN: Verificar si la API Key está configurada
export const checkApiKeyConfiguration = (): boolean => {
  const localStorageKey = localStorage.getItem('GEMINI_API_KEY');
  const envKey = GOOGLE_AI_API_KEY;
  
  return !!(localStorageKey || envKey);
};

const getApiKey = (): string => {
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey) return storedKey;
  
  const envKey = GOOGLE_AI_API_KEY;
  if (envKey) return envKey;
  
  throw new Error("API Key de Gemini no configurada. Configure en Settings.");
};

const getAiClient = () => {
  const apiKey = getApiKey();
  return new GoogleGenerativeAI(apiKey);
};

export const generateTechnicalAnalysis = async (
  questionData: QuestionAnalysisData
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: GEMINI_API_MODEL_TEXT });

    const prompt = `Eres un ingeniero experto en vibraciones. Analiza esta pregunta de certificación ISO 18436-2:

PREGUNTA: ${questionData.question}

OPCIONES:
${questionData.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join(n)}

RESPUESTA CORRECTA: ${String.fromCharCode(65 + questionData.correctIndex)}

INSTRUCCIONES:
- Explica en 2-3 oraciones POR QUÉ la respuesta correcta es técnicamente válida
- Explica en 1 oración por qué CADA opción incorrecta es errónea
- Usa terminología técnica específica, NO referencias genéricas a normas
- Máximo 150 palabras total
- Formato: párrafos cortos, sin listas numeradas

Ejemplo de respuesta esperada:
"La opción B es correcta porque en termografía las mediciones relativas eliminan variables ambientales y detectan anomalías por comparación. La opción A falla porque la precisión absoluta requiere calibración costosa. La opción C es incorrecta ya que la temperatura es fundamental para detectar fricción, cojinetes defectuosos y sobrecargas eléctricas."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Respuesta vacía de la IA");
    }
    
    return text.trim();
    
  } catch (error) {
    console.error("Error generando análisis técnico:", error);
    
    // Fallback con análisis básico
    return generateFallbackAnalysis(questionData);
  }
};

const generateFallbackAnalysis = (questionData: QuestionAnalysisData): string => {
  return `
**Análisis Técnico - ${questionData.topic}**

**Fundamento ISO 18436-2:** Esta pregunta evalúa conocimientos fundamentales del área "${questionData.topic}" según los requisitos para ${questionData.category}.

**Respuesta Correcta:** ${String.fromCharCode(65 + questionData.correctIndex)} - ${questionData.correctAnswer}

Esta opción es correcta porque cumple con los principios establecidos en la norma ISO 18436-2 para el nivel de competencia requerido.

**Conceptos Clave:** 
- Dominio de fundamentos teóricos
- Aplicación práctica de principios
- Comprensión de la normativa técnica

**Recomendación:** Revisar material de estudio específico sobre "${questionData.topic}" y consultar la norma ISO 18436-2 secciones relevantes para ${questionData.category}.
`;
};

// Función para generar múltiples análisis en lote
export const generateBatchAnalysis = async (
  questions: QuestionAnalysisData[]
): Promise<{ [questionId: string]: string }> => {
  const results: { [questionId: string]: string } = {};
  
  // Procesar en lotes de 3 para evitar sobrecarga de API
  const batchSize = 3;
  
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (questionData, index) => {
      try {
        // Pequeño delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 1000));
        
        const analysis = await generateTechnicalAnalysis(questionData);
        return { id: `question_${i + index}`, analysis };
      } catch (error) {
        console.error(`Error en pregunta ${i + index}:`, error);
        return { 
          id: `question_${i + index}`, 
          analysis: generateFallbackAnalysis(questionData) 
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(result => {
      results[result.id] = result.analysis;
    });
  }
  
  return results;
};