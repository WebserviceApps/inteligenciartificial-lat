// Archivo: netlify/functions/submit-brevo.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email } = JSON.parse(event.body);
  const API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = #3
; // <-- ¡¡IMPORTANTE: REEMPLAZA 123 CON EL ID DE TU LISTA!!

  if (!name || !email || !API_KEY) {
    return { statusCode: 400, body: 'Faltan datos o configuración del servidor.' };
  }

  const contactData = {
    email: email,
    attributes: { FIRSTNAME: name },
    listIds: [LIST_ID],
    updateEnabled: true
  };

  try {
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
      console.error('Brevo API Error:', errorBody);
      return { statusCode: response.status, body: errorBody };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };

  } catch (error) {
    console.error('Submission Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error.' }) };
  }
};