// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// URL de la API de Brevo para contactos
const BREVO_API_URL_CONTACTS = "https://api.brevo.com/v3/contacts";

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint para registrar contactos en Brevo
app.post("/brevo-proxy/register-contact", async (req, res) => {
  // Para Firebase Functions v2 con secrets, la API key estará disponible como variable de entorno
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  console.log("API Key configurada:", BREVO_API_KEY ? "SÍ" : "NO");

  // 1. Verifica que la API Key esté configurada
  if (!BREVO_API_KEY) {
    console.error("Error: La clave API de Brevo no está configurada en el backend");
    return res.status(500).json({
      message: "Error de configuración del servidor. Contacta al administrador.",
      debug: "BREVO_API_KEY secret no encontrado"
    });
  }

  // 2. Extrae los datos del usuario del cuerpo de la petición
  const {email, attributes} = req.body;

  console.log("Datos recibidos:", {email, attributes});

  // 3. Validación básica de los datos recibidos
  if (!email || !attributes || !attributes.FIRSTNAME || !attributes.USERNAME) {
    console.warn("Faltan datos requeridos en la petición:", req.body);
    return res.status(400).json({
      message: "Faltan datos requeridos (email, FIRSTNAME, USERNAME) en la solicitud."
    });
  }

  // Validación adicional para campos opcionales pero recomendados
  if (!attributes.LASTNAME) {
    console.warn("LASTNAME no proporcionado, pero continuando...");
  }
  if (!attributes.COUNTRY) {
    console.warn("COUNTRY no proporcionado, pero continuando...");
  }

  // 4. Prepara el payload para enviar a la API de Brevo
  const brevoPayload = {
    email: email,
    attributes: attributes
  };

  // 5. Realiza la llamada a la API de Brevo
  try {
    console.log("Enviando payload a Brevo:", JSON.stringify(brevoPayload, null, 2));

    const brevoResponse = await axios.post(
      BREVO_API_URL_CONTACTS,
      brevoPayload,
      {
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    // 6. Procesa la respuesta de Brevo
    if (brevoResponse.status === 201 || brevoResponse.status === 204) {
      console.log("Contacto registrado/actualizado en Brevo:", brevoResponse.data);
      res.status(200).json({
        message: "Contacto registrado exitosamente en Brevo.",
        data: brevoResponse.data
      });
    } else {
      console.warn("Respuesta inesperada de Brevo:", brevoResponse.status, brevoResponse.data);
      res.status(brevoResponse.status).json({
        message: "Respuesta inesperada del servicio de Brevo.",
        details: brevoResponse.data
      });
    }
  } catch (err) {
    console.error("Error al contactar a la API de Brevo:", err);
    
    if (err.response) {
      console.error("Datos del error de Brevo:", err.response.data);
      console.error("Status del error de Brevo:", err.response.status);

      // Manejo específico para email duplicado
      if (err.response.data && err.response.data.code === "duplicate_parameter" &&
        err.response.data.message &&
        err.response.data.message.includes("Email address")) {
        console.log("Intento de registrar email duplicado.");
        return res.status(409).json({
          message: "El correo electrónico ya está registrado en nuestra base de datos de marketing.",
          code: "duplicate_parameter",
          details: err.response.data
        });
      }

      // Para otros errores de respuesta de Brevo
      res.status(err.response.status).json({
        message: "Error al registrar el contacto en Brevo.",
        details: err.response.data
      });
    } else if (err.request) {
      console.error("No se recibió respuesta de Brevo:", err.request);
      res.status(503).json({
        message: "No se pudo contactar al servicio de Brevo. Inténtalo más tarde."
      });
    } else {
      console.error("Error al configurar la petición a Brevo:", err.message);
      res.status(500).json({
        message: "Error del servidor al procesar la solicitud de registro."
      });
    }
  }
});

module.exports = app;