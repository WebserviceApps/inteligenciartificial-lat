// Archivo: netlify/functions/submit-brevo.js
// VERSIÓN CORREGIDA Y FINAL

exports.handler = async function(event) {
  // Solo permitir solicitudes POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email } = JSON.parse(event.body);
    const API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = 3; // <-- ¡¡IMPORTANTE: REEMPLAZA 123 CON EL ID DE TU LISTA!!

    if (!name || !email || !API_KEY || !LIST_ID) {
      console.error("Faltan datos o configuración: ", { name, email, API_KEY_exists: !!API_KEY, LIST_ID });
      return { statusCode: 400, body: JSON.stringify({ message: 'Faltan datos o configuración del servidor.' }) };
    }

    const contactData = {
      email: email,
      attributes: { FIRSTNAME: name },
      listIds: [LIST_ID],
      updateEnabled: true
    };

    // Usamos import() dinámico para node-fetch
    const { default: fetch } = await import('node-fetch');

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error de la API de Brevo:', errorBody);
      return { statusCode: response.status, body: JSON.stringify({ message: 'Error al contactar el servicio de email.', details: errorBody }) };
    }

    const responseData = await response.json();
    return { statusCode: 200, body: JSON.stringify({ message: 'Success', data: responseData }) };

  } catch (error) {
    console.error('Error en la ejecución de la función:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error interno del servidor.', details: error.message }) };
  }
};