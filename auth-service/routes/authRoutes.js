const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 

// Registro de usuario
router.post('/register', authController.registrarUsuario); 

// Login de usuario
router.post('/login', authController.iniciarSesion); 

// Verificación del token
router.get('/protected', authController.rutaProtegida);

router.get('/logout', authController.cerrarSesion);

module.exports = router;
