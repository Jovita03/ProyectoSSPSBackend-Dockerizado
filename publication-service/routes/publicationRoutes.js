const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publicationController');

router.get('/', publicationController.obtenerPublicaciones);
router.post('/', publicationController.crearPublicacion);
router.post('/delete', publicationController.eliminarPublicacion); 
router.post('/comments', publicationController.obtenerComentarios);
router.post('/addComment', publicationController.agregarComentario);
router.post('/deleteComments', publicationController.eliminarComentarios); 

module.exports = router;