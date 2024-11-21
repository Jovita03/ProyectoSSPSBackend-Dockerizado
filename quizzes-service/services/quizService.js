const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const crearQuiz = async (Title, Description, preguntas) => {
    try {
        const { data: quizData, error: quizError } = await supabase
        .from('Quiz')
        .insert([{ Title, Description }])
        .select('id');

        if (quizError) {
        console.error("Error inserting data into Quiz table:", quizError);
        throw new Error("Error al insertar quiz");
        }

        const quizId = quizData[0]?.id;

        const questionsData = preguntas.map((pregunta) => ({
        Id_Quiz: quizId,
        Question: pregunta.texto,
        }));

        const { data: questionsInserted, error: questionsError } = await supabase
        .from('Questions')
        .insert(questionsData)
        .select('id');

        if (questionsError) {
        console.error("Error inserting data into Questions table:", questionsError);
        throw new Error("Error al insertar preguntas");
        }

        const optionsData = [];
        questionsInserted.forEach((question, index) => {
        const pregunta = preguntas[index];
        pregunta.opciones.forEach((opcion, opcionIndex) => {
            optionsData.push({
            Id_Question: question.id,
            Option: opcion,
            Is_Correct: opcionIndex === pregunta.respuestaCorrecta,
            });
        });
        });

        const { error: optionsError } = await supabase
        .from('Options')
        .insert(optionsData);

        if (optionsError) {
        console.error("Error inserting data into Options table:", optionsError);
        throw new Error("Error al insertar opciones");
        }

        return quizId;
    } catch (err) {
        console.error("Error al crear quiz:", err);
        throw new Error("Error al crear quiz"); 
    }
};

const eliminarQuiz = async (id) => {
    try {
        const { error } = await supabase
        .from('Quiz')
        .delete()
        .eq('id', id);

        if (error) {
        console.error('Error al eliminar quiz:', error);
        throw new Error('Error al eliminar quiz');
        }
    } catch (err) {
        console.error('Error al eliminar quiz:', err);
        throw new Error('Error al eliminar quiz'); 
    }
};

const obtenerQuizzes = async () => {
    try {
        const { data: quizzes, error } = await supabase
        .from('Quiz')
        .select(`
                id,
                Title,
                Description,
                Questions (
                    id,
                    Question,
                    Id_Quiz,
                    Options (
                        Option,
                        Is_Correct
                    )
                )
            `);

        if (error) {
        console.error("Error al obtener quizzes:", error);
        throw new Error("Error al obtener quizzes");
        }

        const formattedQuizzes = quizzes.map((quiz) => ({
        id: quiz.id,
        titulo: quiz.Title,
        descripcion: quiz.Description,
        preguntas: quiz.Questions.map((question) => ({
            texto: question.Question,
            opciones: question.Options.map((option) => option.Option),
            respuestaCorrecta: question.Options.findIndex((option) => option.Is_Correct),
        })),
        }));

        return formattedQuizzes;
    } catch (err) {
        console.error("Error al obtener quizzes:", err);
        throw new Error("Error al obtener quizzes"); 
    }
};

module.exports = {
    crearQuiz,
    eliminarQuiz,
    obtenerQuizzes
};