const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:email', userController.obtenerUsuario);
router.get('/', userController.listarUsuarios);
router.post('/toggleBlock', userController.toggleBlockUsuario);


module.exports = router;