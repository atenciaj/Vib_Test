const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

// Definir el secret de Brevo
const brevoApiKey = defineSecret("BREVO_API_KEY");

// Import your Express application from server.js
const app = require("./server");

/**
 * Expone tu aplicación Express como una función HTTP de Firebase v2.
 * Incluye el secret de Brevo para que esté disponible en el runtime.
 */
exports.api = onRequest({
  cors: true,
  maxInstances: 10,
  secrets: [brevoApiKey] // Hace que el secret esté disponible
}, app);