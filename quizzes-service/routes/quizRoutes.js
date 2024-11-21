const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/', quizController.crearQuiz);
router.delete('/:id', quizController.eliminarQuiz);
router.get('/', quizController.obtenerQuizzes);

module.exports = router;