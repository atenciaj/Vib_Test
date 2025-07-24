import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Leer la clave de API exactamente como tu app
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.split('=')[1].trim();

console.log('🔑 Usando clave:', apiKey.substring(0, 10) + '...');

// Usar exactamente el mismo modelo que tu app
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Usar exactamente el mismo prompt que tu app
const prompt = `Eres un ingeniero experto en vibraciones. Analiza esta pregunta de certificación ISO 18436-2:

PREGUNTA: Is it important to be able to take an accurate temperature measurement with thermography?

OPCIONES:
A. Yes, accuracy is always important.
B. No; a relative temperature reading can also be useful.
C. No; temperature is not important in thermography.

RESPUESTA CORRECTA: B

INSTRUCCIONES:
- Explica en 2-3 oraciones POR QUÉ la respuesta correcta es técnicamente válida
- Explica en 1 oración por qué CADA opción incorrecta es errónea
- Usa terminología técnica específica, NO referencias genéricas a normas
- Máximo 150 palabras total
- Formato: párrafos cortos, sin listas numeradas

Ejemplo de respuesta esperada:
"La opción B es correcta porque en termografía las mediciones relativas eliminan variables ambientales y detectan anomalías por comparación. La opción A falla porque la precisión absoluta requiere calibración costosa. La opción C es incorrecta ya que la temperatura es fundamental para detectar fricción, cojinetes defectuosos y sobrecargas eléctricas."`;

async function test() {
  try {
    console.log('🚀 Enviando prompt...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ RESPUESTA RECIBIDA:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    console.log('📊 Longitud:', text.length, 'caracteres');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

test();
