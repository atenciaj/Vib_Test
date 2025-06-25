// server.js
// Carga las variables de entorno desde .env
// La carga de dotenv solo es necesaria para pruebas locales si las realizas,
// en Firebase Functions las variables de entorno se inyectan directamente.
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
// Eliminada: PORT no se usa en Firebase Functions
// const PORT = process.env.PORT || 3001;

// MOVIMOS la definición de BREVO_API_KEY DENTRO del manejador de ruta
// const BREVO_API_KEY = process.env.api_keys.brevo_backend;

// URL de la API de Brevo para contactos
const BREVO_API_URL_CONTACTS = "https://api.brevo.com/v3/contacts";

// Middlewares
// CORS: Permite que tu frontend (en un puerto o dominio diferente) pueda
// hacer peticiones a este backend.
app.use(cors());
// Express.json: Middleware para parsear cuerpos de peticiones con formato JSON.
app.use(express.json());

// Endpoint para registrar contactos en Brevo
// Escucha petic POST en la ruta '/brevo-proxy/register-contact' (MODIFICADO)
app.post("/brevo-proxy/register-contact", async (req, res) => { // << RUTA MO
  // Obtiene la API Key de la variable de entorno AQUI, dentro del manejador
  // Accedemos a ella como process.env.api_keys.brevo_backend
  const BREVO_API_KEY = process.env.api_keys.brevo_backend;

  // 1. Verifica que la API Key esté configurada
  // NOTA: Si se usa 'firebase functions:config:set', esta verificación
  // con `!BREVO_API_KEY` sigue siendo válida.
  if (!BREVO_API_KEY) {
    console.error(
        "Error: La clave API de Brevo no está configurada en el backend " +
      "(esperaba process.env.api_keys.brevo_backend).",
    );
    // Responde al frontend con un error 500 (Error interno del servidor)
    return res
        .status(500)
        .json({message: "Error de configur del serv. Contacta al adminin."});
  }

  // 2. Extrae los datos del usuario del cuerpo de la petición POST del frontend
  const {email, attributes} = req.body;

  // 3. Validación básica de los datos recibidos
  // Verifica que los campos mínimos requeridos estén presentes
  if (!email || !attributes || !attributes.FIRSTNAME || !attributes.USERNAME) {
    console.warn("Faltan datos requeridos en la petición:", req.body);
    // Responde al frontend con un error 400 (Bad Request - Petición Incorrecta)
    return res.status(400).json({
      message: "Faltan datos requ (email, nombre, username) en solicitud.",
    });
  }

  // 4. Prepara el payload para enviar a la API de Brevo
  const brevoPayload = {
    email: email,
    attributes: attributes, // attributes debe ser un objeto como
    // { FIRSTNAME: '...', LASTNAME: '...', ... }
    // Opcional: Si quieres añadir contactos a una lista específica en Brevo,
    // descomenta y reemplaza el ID
    // listIds: [ID_DE_TU_LISTA_EN_BREVO] // Reemplaza ID_DE_TU_LISTA_EN_BREVO
    // con el número de ID de tu lista en Brevo
  };

  // 5. Realiza la llamada a la API de Brevo
  try {
    // Log para depuración
    console.log("Env.payload a Brevo:", JSON.stringify(brevoPayload, null, 2));

    const brevoResponse = await axios.post(
        BREVO_API_URL_CONTACTS,
        brevoPayload,
        {
          headers: {
            "accept": "application/json",
            "api-key": BREVO_API_KEY, // Usa la API Key segura del backend
            "content-type": "application/json",
          },
        },
    );

    // 6. Procesa la respuesta de Brevo
    // Brevo devuelve 201 Created si el contacto es nuevo
    // Brevo devuelve 204 No Content si el contacto ya existe y se actualiza
    if (brevoResponse.status === 201 || brevoResponse.status === 204) {
      // Log para depuración
      console.log("Contacto regist/actualizado en Brevo:", brevoResponse.data);
      // Responde al frontend indicando éxito (código 200 OK)
      res.status(200).json({
        message: "Contacto registrado exitosamente en Brevo.",
        data: brevoResponse.data, // Puedes enviar datos de vuelta si Brevo
        // los proporciona y son útiles
      });
    } else {
      // Este caso es menos común si axios no lanza un error  códigos no 2xx,
      // pero es buena práctica manejarlo.
      console.warn("Respuesta inesperada de Brevo:", brevoResponse.status,
          brevoResponse.data);
      // Responde al frontend con el mismo código de estado  o un 500 genérico
      // si prefieres
      res.status(brevoResponse.status).json({
        message: "Respuesta inesperada del servicio de Brevo.",
        details: brevoResponse.data, // Envía los detalles del error de Brevo
        // si existen
      });
    }
  } catch (err) { // Usando 'err' en lugar de error para evitar confl de ESLint
    // 7. Maneja los errores de la llamada a la API de Brevo
    console.error("Error al contactar a la API de Brevo:");
    if (err.response) {
      // Error recibido desde el servidor de Brevo (ej. 400, 401, 409)
      console.error("Datos del error de Brevo:", err.response.data);
      console.error("Status del error de Brevo:", err.response.status);

      // Manejo específico para errores comunes de Brevo, como email duplicado
      if (err.response.data && err.response.data.code === "duplic_parameter" &&
        err.response.data.message &&
        err.response.data.message.includes("Email address")
      ) {
        console.log("Intento de registrar email duplicado.");
        // Responde al frontend con un error 409 Conflict
        return res.status(409).json({
          message: " correo electrónico regist en nuestra bd de marketing.",
          code: "duplicate_parameter",
          details: err.response.data, // Incluye detalles del error de Brevo
        });
      }

      // Para otros errores de respuesta de Brevo
      res.status(err.response.status).json({
        message: "Error al registrar el contacto en Brevo.",
        details: err.response.data, // Incluye los detalles del error de Brevo
      });
    } else if (err.request) {
      // La petición se hizo, no  respuesta (ej. problema de red, Brevo caído)
      console.error("No se recibió respuesta de Brevo:", err.request);
      // Responde al frontend con un error 503 Service Unavailable
      res.status(503).json({
        message: "No  contact al servicio de Brevo. Inténtalo más tarde.",
      });
    } else {
      // Algo más causó el error antes de enviar la petición
      console.error("Error configurar la petición a Brevo:", err.message);
      // Responde al frontend con un error 500 Internal Server Error
      res.status(500).json({
        message: "Error servidor al procesar la solicitud de registro.",
      });
    }
  }
});
module.exports = app;
