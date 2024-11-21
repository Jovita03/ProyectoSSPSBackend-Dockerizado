const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/type', topicController.obtenerTipos);
router.post('/', topicController.agregarTema);
router.get('/', topicController.obtenerTemas);
router.post('/delete', topicController.eliminarTema); 

module.exports = router;
