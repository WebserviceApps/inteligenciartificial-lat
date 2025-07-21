// Importa 'fetch' si usas una versión de Node.js que no lo tiene globalmente.
// Netlify Functions v2 (por defecto) ya lo incluye, así que no es estrictamente necesario.
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Solo permitir peticiones POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Obtener los datos del formulario desde el cuerpo de la petición
    const { name, email } = JSON.parse(event.body);

    // 3. Validar que tengamos un email
    if (!email) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email es requerido.' }) };
    }

    // 4. Obtener la API Key de las variables de entorno de Netlify (¡Más seguro!)
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'La API key de Brevo no está configurada.' }) };
    }

    // 5. Preparar los datos para la API de Brevo
    const contactData = {
        email: email,
        attributes: {
            // Asegúrate que 'FIRSTNAME' es el nombre del atributo en tu cuenta de Brevo
            FIRSTNAME: name 
        },
        // Opcional: ID de la lista a la que quieres añadir el contacto
        // listIds: [1, 2, 3] 
    };

    // 6. Realizar la llamada a la API de Brevo
    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(contactData)
        });

        // 7. Manejar la respuesta de Brevo
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error de Brevo:', errorData);
            return { statusCode: response.status, body: JSON.stringify({ error: 'Hubo un problema al registrar el contacto.' }) };
        }

        // 8. Enviar una respuesta de éxito al frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '¡Contacto añadido exitosamente!' })
        };

    } catch (error) {
        console.error('Error en la función de Netlify:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor.' })
        };
    }
};