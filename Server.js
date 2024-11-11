const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Ruta raíz para verificar que el servidor está en funcionamiento
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando!');
});

// Ruta GET para verificar si un usuario con un correo electrónico ya existe
app.get('/users', async (req, res) => {
    const { email } = req.query;  // Obtener el correo electrónico desde la consulta

    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, created_at, isAdmin')  // Excluye la contraseña
            .eq('email', email);  // Buscar por correo electrónico

        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ message: 'Error al obtener datos de Supabase' });
        }

        if (data && Array.isArray(data) && data.length > 0) {
            // Si encontramos el usuario, devolver sus datos
            return res.json(data[0]);
        } else {
            // Si no encontramos el usuario, devolver un mensaje de "usuario no encontrado"
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al obtener datos de Supabase', error: error.message });
    }
});

const bcrypt = require('bcrypt');

app.post('/users', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de rondas de sal

        // Insertar el nuevo usuario con la contraseña hasheada
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, full_name: fullName, isAdmin: false }]);

        if (error) {
            console.error("Error al insertar el usuario:", error);
            return res.status(500).json({ message: 'Error al registrar el usuario', details: error.message });
        }

        // Responder con un mensaje de éxito
        return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son necesarios' });
    }

    try {
        // Buscar el usuario en la tabla `users`
        const { data, error } = await supabase
            .from('users')
            .select('id, email, password, full_name, isAdmin')
            .eq('email', email)
            .single(); // Retorna un solo registro

        if (error || !data) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Comparar la contraseña ingresada con la hasheada
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si coincide, responder con éxito
        return res.status(200).json({ message: 'Inicio de sesión exitoso', user: { email: data.email, full_name: data.full_name } });
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});

app.get('/publication', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('publication')
            .select('*');
        
        if (error) {
            console.error("Error al obtener publicaciones:", error);
            return res.status(500).json({ message: 'Error al obtener publicaciones' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al obtener publicaciones', error: error.message });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
