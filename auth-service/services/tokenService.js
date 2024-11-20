// auth-service/services/tokenService.js

const jwt = require('jsonwebtoken');

// Crear un token JWT
const generateToken = (userId, fullName, isAdmin) => {
    return jwt.sign({ id: userId, name: fullName, isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Verificar un token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Token no válido');
    }
};

module.exports = { generateToken, verifyToken };