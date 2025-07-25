import { ExamCategory } from './types'; // Added import for ExamCategory

export const GEMINI_API_MODEL_TEXT = "gemini-1.5-flash";
export const GEMINI_API_MODEL_IMAGE = "imagen-3.0-generate-002"; // Though not used in this version

export const APP_NAME = "Vib-Test";

export const EXAM_PASS_MARK_PERCENT = 70;

export const DEFAULT_EXAM_CONFIG = {
  [ExamCategory.CAT_I]: { duration: 120, questions: 60 },
  [ExamCategory.CAT_II]: { duration: 180, questions: 100 },
  [ExamCategory.CAT_III]: { duration: 240, questions: 100 },
  [ExamCategory.CAT_IV]: { duration: 300, questions: 60 },
};

export const TRIAL_QUESTION_COUNT = 20;
export const TRIAL_EXAM_DURATION_MINUTES = 30; // Example duration for 20 questions

// ADMIN CREDENTIALS - CORREGIDO PARA COINCIDIR CON EL BACKEND
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = '1234'; // CAMBIADO DE '123456789' A '1234'

// IMPORTANT: BREVO_API_KEY should ideally be handled by a backend service in production
// and not exposed in client-side code. This is for demonstration purposes only.
// Commented out since we now use Firebase secrets for security
// export const BREVO_API_KEY = "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";
export const BREVO_API_URL_CONTACTS = "https://api.brevo.com/v3/contacts";

// Placeholder for formulas - ideally this would be more extensive and categorized
export const COMMON_FORMULAS = [
  { name: "Frequency (Hz)", formula: "f = 1 / T" , description: "T = Period in seconds"},
  { name: "Frequency (CPM)", formula: "f = 60 / T" , description: "T = Period in seconds"},
  { name: "Velocity (ips)", formula: "V = 2 * π * f * D" , description: "f = frequency in Hz, D = displacement in inches pk-pk. Result is pk velocity."},
  { name: "Acceleration (g)", formula: "A = (2 * π * f)² * D / 386.4" , description: "f = frequency in Hz, D = displacement in inches pk-pk. Result is pk acceleration in g's."},
  { name: "Displacement from Velocity", formula: "D = V / (π * f)" , description: "V = velocity in ips pk, f = frequency in Hz. Result is pk-pk displacement."},
];

// Topics based on ISO 18436-2 Annex A (simplified for brevity)
export const TOPICS_CAT_I = [
  "Principles of vibration",
  "Data acquisition",
  "Signal processing (basic)",
  "Condition Monitoring (basic)",
  "Fault analysis (common faults: unbalance, misalignment, looseness, bearing faults)",
  "Corrective action (awareness)",
];

export const TOPICS_CAT_II = [
  ...TOPICS_CAT_I,
  "Data acquisition (advanced)",
  "Signal processing (FFT, windowing, averaging)",
  "Condition Monitoring (program design, alarms)",
  "Fault analysis (spectrum, time waveform, phase)",
  "Corrective action (balancing, alignment awareness)",
  "Equipment knowledge (motors, pumps, fans)",
];

export const TOPICS_CAT_III = [
  ...TOPICS_CAT_II,
  "Signal processing (advanced, spectral maps, enveloping)",
  "Condition Monitoring (program management, alternative technologies)",
  "Fault analysis (transients, orbits, gears, electrical)",
  "Corrective action (resonance correction, isolation)",
  "Equipment testing (impact, ODS basics)",
  "Standards and reporting",
];

export const TOPICS_CAT_IV = [
  ...TOPICS_CAT_III,
  "Advanced dynamics (non-linear, instabilities)",
  "Advanced signal processing (torsional)",
  "Condition Monitoring (financial justification, program optimization)",
  "Fault analysis (fluid film bearings, flexible rotors)",
  "Advanced corrective actions",
  "Advanced equipment testing (modal analysis, torsional analysis)",
  "Rotor dynamics",
];

export const ALL_TOPICS_BY_CATEGORY = {
  [ExamCategory.CAT_I]: TOPICS_CAT_I,
  [ExamCategory.CAT_II]: TOPICS_CAT_II,
  [ExamCategory.CAT_III]: TOPICS_CAT_III,
  [ExamCategory.CAT_IV]: TOPICS_CAT_IV,
};

// Nuevos endpoints para verificación de email
export const BREVO_PROXY_VERIFICATION_ENDPOINT = 'https://us-central1-vib-test-d5aec.cloudfunctions.net/api/brevo-proxy/register-with-verification';
export const BREVO_PROXY_VERIFY_ENDPOINT = 'https://us-central1-vib-test-d5aec.cloudfunctions.net/api/brevo-proxy/verify-email';

// ID de plantilla de Brevo - Template Vib-Test verificación
export const BREVO_VERIFICATION_TEMPLATE_ID = 7; // Template Vib-Test verificación

// Configuración de API Key para producción
export const GOOGLE_AI_API_KEY = "AIzaSyANMFKK03msbW4luKiLsv9wa0zxLde0V2g";