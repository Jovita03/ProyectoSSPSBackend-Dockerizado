const jwt = require('jsonwebtoken');

const generateToken = (userId, fullName, isAdmin) => {
    return jwt.sign({ id: userId, name: fullName, isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Token no válido');
    }
};

module.exports = { generateToken, verifyToken };