const quizService = require('../services/quizService');

const crearQuiz = async (req, res) => {
    const Title = req.body.titulo;
    const Description = req.body.descripcion;
    const preguntas = req.body.preguntas;

    try {
        const quizId = await quizService.crearQuiz(Title, Description, preguntas);
        res.status(200).json({ message: "Quiz, questions, and options created successfully", quizId });
    } catch (error) {
        console.error("Error al crear quiz:", error);
        res.status(500).json({ message: "Error al crear quiz", error: error.message });
    }
};

const eliminarQuiz = async (req, res) => {
    const id = req.params.id; 

    try {
        await quizService.eliminarQuiz(id);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error al eliminar quiz:', error);
        res.status(500).json({ message: 'Error al eliminar quiz', error: error.message });
    }
};

const obtenerQuizzes = async (req, res) => {
    try {
        const formattedQuizzes = await quizService.obtenerQuizzes();
        res.status(200).json(formattedQuizzes);
    } catch (error) {
        console.error("Error al obtener quizzes:", error);
        res.status(500).json({ message: "Error al obtener quizzes", error: error.message });
    }
};

module.exports = {
    crearQuiz,
    eliminarQuiz,
    obtenerQuizzes
};