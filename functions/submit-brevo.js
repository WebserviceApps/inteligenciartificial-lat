// Importa un cliente para hacer peticiones HTTP. 'node-fetch' es una opción popular.
// Debes instalarlo ejecutando: npm install node-fetch
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // 1. Validar que la petición sea de tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    // 2. Extraer los datos (nombre y email) del cuerpo de la petición
    const { name, email } = JSON.parse(event.body);

    // Valida que el email exista
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'El email es requerido' }),
      };
    }

    // 3. Prepara los datos para enviar a la API de Brevo
    // IMPORTANTE: Guarda tu clave de API en las variables de entorno de Netlify
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = 1; // Cambia esto por el ID de tu lista de contactos en Brevo

    const contactData = {
      email: email,
      attributes: {
        // Asegúrate que 'NOMBRE' es el nombre del atributo en tu cuenta de Brevo
        NOMBRE: name,
      },
      listIds: [BREVO_LIST_ID],
    };

    // 4. Realiza la llamada a la API de Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(contactData),
    });
    
    // 5. Verifica si la llamada a Brevo fue exitosa
    if (!response.ok) {
        // Si Brevo devuelve un error, lo capturamos y lo mostramos
        const errorData = await response.json();
        console.error('Error de Brevo:', errorData);
        return {
            statusCode: response.status,
            body: JSON.stringify({ message: 'Error al agregar contacto a Brevo.' }),
        };
    }

    // 6. Devuelve una respuesta exitosa al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ message: '¡Contacto agregado exitosamente!' }),
    };

  } catch (error) {
    // Captura cualquier otro error (ej. JSON mal formado)
    console.error('Error en la función:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor.' }),
    };
  }
};