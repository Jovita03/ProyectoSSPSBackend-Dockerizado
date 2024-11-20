const express = require('express');
const { registerUser, verifyUser } = require('../services/authService');
const { generateToken } = require('../services/tokenService');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        const { user } = await registerUser(email, password, fullName);

        const token = generateToken(user.id, user.full_name, user.isAdmin);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60, // 1 hora
            sameSite: 'strict'
        });

        return res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son necesarios' });
    }

    try {
        const { user } = await verifyUser(email, password);

        const token = generateToken(user.id, user.full_name, user.isAdmin);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60, // 1 hora
            sameSite: 'strict'
        });

        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Verificación del token
router.get('/protected', (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    try {
        const decoded = verifyToken(token);
        return res.status(200).json({ message: 'Acceso autorizado', user: decoded });
    } catch (error) {
        return res.status(403).json({ message: 'Token no válido' });
    }
});

module.exports = router;