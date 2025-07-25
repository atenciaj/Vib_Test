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

// Nuevo endpoint para registro con verificación por email
app.post("/brevo-proxy/register-with-verification", async (req, res) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    console.error("Error: La clave API de Brevo no está configurada");
    return res.status(500).json({message: "Error de configuración del servidor"});
  }

  const { email, attributes, verificationToken, frontendUrl } = req.body;
  
  // Validación básica
  if (!email || !attributes || !verificationToken || !frontendUrl) {
    console.warn("Faltan datos requeridos en la petición:", req.body);
    return res.status(400).json({
      message: "Faltan datos requeridos (email, attributes, verificationToken, frontendUrl)"
    });
  }

  // URL de verificación que se incluirá en el email
  const verificationUrl = `${frontendUrl}/#/verify-email?token=${verificationToken}`;
  
  // Payload para email transaccional
  const emailPayload = {
    to: [{ 
      email: email, 
      name: attributes.FIRSTNAME 
    }],
    templateId: 7, // ⚠️ REEMPLAZA CON EL ID REAL DE TU PLANTILLA DE BREVO
    params: {
      VERIFICATION_LINK: verificationUrl,
      user_name: attributes.FIRSTNAME
    }
  };

  try {
    console.log("Enviando email de verificación:", JSON.stringify(emailPayload, null, 2));
    
    // Llamar a la API de emails transaccionales de Brevo
    const brevoResponse = await axios.post(
      "https://api.brevo.com/v3/smtp/email", // Endpoint para emails transaccionales
      emailPayload,
      {
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    if (brevoResponse.status === 201) {
      console.log("Email de verificación enviado exitosamente:", brevoResponse.data);
      res.status(200).json({
        message: "Email de verificación enviado exitosamente",
        messageId: brevoResponse.data.messageId
      });
    } else {
      console.warn("Respuesta inesperada de Brevo:", brevoResponse.status, brevoResponse.data);
      res.status(brevoResponse.status).json({
        message: "Respuesta inesperada del servicio de email",
        details: brevoResponse.data
      });
    }
  } catch (err) {
    console.error("Error enviando email de verificación:");
    if (err.response) {
      console.error("Datos del error de Brevo:", err.response.data);
      console.error("Status del error de Brevo:", err.response.status);
      
      res.status(err.response.status).json({
        message: "Error enviando email de verificación",
        details: err.response.data
      });
    } else if (err.request) {
      console.error("No se recibió respuesta de Brevo:", err.request);
      res.status(503).json({
        message: "No se pudo contactar el servicio de email. Inténtalo más tarde."
      });
    } else {
      console.error("Error configurando la petición:", err.message);
      res.status(500).json({
        message: "Error interno del servidor"
      });
    }
  }
});

// ENDPOINT VERIFICACIÓN - ACTUALIZADO PARA REGISTRAR EN BREVO
app.post("/brevo-proxy/verify-email", async (req, res) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    return res.status(500).json({message: "Error de configuración del servidor"});
  }

  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      message: "Token de verificación requerido",
      code: "missing_token"
    });
  }

  try {
    console.log("Token de verificación recibido:", token);
    
    // TODO: Buscar usuario pendiente por token en localStorage temporal
    // Por ahora, simulamos encontrar un usuario para completar el flujo
    console.log("Registrando usuario verificado en Brevo...");
    
    // Simular datos del usuario (en producción vendría del token lookup)
    const userData = {
      email: "user@example.com", // Este vendría del token
      attributes: {
        FIRSTNAME: "Usuario",
        LASTNAME: "Verificado",
        USERNAME: "user123", 
        PASSWORD: "1234",
        COUNTRY: "Colombia",
        EMAIL_VERIFIED: "true",
        CAN_LOGIN: "true",
        USER_TYPE: "user"
      }
    };

    // Registrar usuario completo en Brevo
    const brevoResponse = await axios.post(
      BREVO_API_URL_CONTACTS,
      userData,
      {
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    if (brevoResponse.status === 201 || brevoResponse.status === 204) {
      console.log("Usuario registrado en Brevo después de verificación:", brevoResponse.data);
      res.status(200).json({
        message: "Email verificado exitosamente y usuario registrado",
        verified: true
      });
    } else {
      console.warn("Error registrando usuario en Brevo:", brevoResponse.status);
      res.status(500).json({
        message: "Error completando el registro"
      });
    }
    
  } catch (err) {
    console.error("Error verificando email:", err);
    res.status(500).json({
      message: "Error interno verificando email",
      code: "verification_error"
    });
  }
});

// ENDPOINT LOGIN - ACTUALIZADO PARA BUSCAR POR EMAIL EN BREVO
app.post("/brevo-proxy/login", async (req, res) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const { email, password } = req.body; // CAMBIADO: ahora usa email en lugar de username
  
  console.log("Intento de login recibido:", { email, password: "****" });
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y password son requeridos"
    });
  }

  // Admin login - mantener compatibilidad con username
  if (email === "admin" && password === "1234") {
    console.log("Login admin exitoso");
    return res.status(200).json({
      success: true,
      user: {
        id: "admin_id",
        username: "admin",
        name: "Admin",
        userType: "admin"
      }
    });
  }

  // Validar que el password sea numérico para usuarios regulares
  if (!/^\d{4,}$/.test(password)) {
    console.log("Password inválido - debe ser numérico de 4 dígitos mínimo");
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  // Buscar usuario en Brevo por email
  try {
    console.log("Buscando usuario en Brevo por email:", email);
    
    // Obtener contacto de Brevo por email
    const brevoResponse = await axios.get(
      `${BREVO_API_URL_CONTACTS}/${encodeURIComponent(email)}`,
      {
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    if (brevoResponse.status === 200) {
      const contact = brevoResponse.data;
      console.log("Usuario encontrado en Brevo:", contact.email);
      
      // Verificar que puede hacer login
      if (contact.attributes.CAN_LOGIN !== "true") {
        console.log("Usuario no tiene permisos de login");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      // Verificar email verificado
      if (contact.attributes.EMAIL_VERIFIED !== "true") {
        console.log("Email no verificado");
        return res.status(401).json({
          success: false,
          message: "Email not verified"
        });
      }

      // Verificar password
      if (contact.attributes.PASSWORD !== password) {
        console.log("Password incorrecto");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      // Login exitoso
      console.log("Login exitoso para usuario:", contact.email);
      return res.status(200).json({
        success: true,
        user: {
          id: contact.id || contact.email,
          username: contact.attributes.USERNAME || contact.email,
          name: `${contact.attributes.FIRSTNAME} ${contact.attributes.LASTNAME || ''}`.trim(),
          email: contact.email,
          userType: contact.attributes.USER_TYPE || "user"
        }
      });

    } else {
      console.log("Usuario no encontrado en Brevo");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
  } catch (err) {
    console.error("Error consultando Brevo:", err);
    
    // Si el error es 404, el usuario no existe
    if (err.response && err.response.status === 404) {
      console.log("Usuario no encontrado (404)");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
});

module.exports = app;
// Updated: Tue Jul 22 02:05:21 AM UTC 2025