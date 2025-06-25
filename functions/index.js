/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at
 * https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// Removed unused 'logger' import
// const logger = require("firebase-functions/logger");

// Import your Express application from server.js
// Make sure your server.js file exports your Express app like:
// module.exports = app;
const app = require("./server");


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container,
// so this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 }); // Applying options per function
// is recommended for v2, but global options can be set here if using v1
// http triggers.

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

/**
 * Expone tu aplicación Express como una función HTTP de Firebase.
 * La ruta base será /api cuando despliegues.
 * Tus rutas de Express (ej. /brevo-proxy/register-contact) serán
 * relativas a /api.
 */
exports.api = functions.https.onRequest(app);
