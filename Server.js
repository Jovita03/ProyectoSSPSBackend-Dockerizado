const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser())


app.get('/', (req, res) => {
    res.send('¡Servidor funcionando!');
});

app.get('/users/:email', async (req, res) => {
    
    const email = req.params.email; //changed the way we send the email from the frontend

    
    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, created_at, isAdmin')
            .eq('email', email); 
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ message: 'Error al obtener datos de Supabase' });
        }
        if (data && Array.isArray(data) && data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al obtener datos de Supabase', error: error.message });
    }
});

const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, full_name: fullName, isAdmin: false }]);

        if (error) {
            console.error("Error al insertar el usuario:", error);
            return res.status(500).json({ message: 'Error al registrar el usuario', details: error.message });
        }
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
        const { data, error } = await supabase
            .from('users')
            .select('id, email, password, full_name, isAdmin')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({id:data.id, name:data.full_name, isAdmin: data.isAdmin} , process.env.SECRET_KEY, {
            expiresIn: '1h'
        });

        console.log(token);
        

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict' 
        });

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
            email: data.email,
            full_name: data.full_name,
            },
            token
        });
            
                    
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});


app.get('/protected', async (req, res) => {
    const token = req.cookies.access_token

    if (!token) {
        return res.status(403).send('Acceso no autorizado')
    }

    try{
        const data = jwt.verify(token, process.env.SECRET_KEY )
        console.log(data)
    }catch(error){
        res.status(403).send('Acceso no autorizado')
    }
})


app.get('/publication', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('publication')
            .select('*');
        
        if (error) {
            console.error("Error al obtener publicaciones:", error);
            return res.status(500).json({ message: 'Error al obtener publicaciones' });
        }

        return res.status(200).json({message: 'Publicaciones recuperadas con exito', publication: data});
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al obtener publicaciones', error: error.message });
    }
});

app.get('/logout', (req, res)=>{
    res.clearCookie('access_token',{
        httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict' 
    })
    res.status(200).json({ message: "Logout exitoso" });

})



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Servidor en ejecución en http://localhost:5000');
});