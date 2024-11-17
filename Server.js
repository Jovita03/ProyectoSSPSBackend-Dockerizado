const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser())


app.get('/', (req, res) => {
    res.send('¡Servidor funcionando!');
});

app.get('/users/:email', async (req, res) => {
    
    const email = req.params.email; //changed the way we send the email from the frontend
    
    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, created_at, isAdmin')
            .eq('email', email); 
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ message: 'Error al obtener datos de Supabase' });
        }
        if (data && Array.isArray(data) && data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error interno:  ", error);
        return res.status(500).json({ message: 'Error al obtener datos de Supabase', error: error.message });
    }
});
   
const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, full_name: fullName, isAdmin: false }]);

        if (error) {
            console.error("Error al insertar el usuario:", error);
            return res.status(500).json({ message: 'Error al registrar el usuario', details: error.message });
        }
        return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son necesarios' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, password, full_name, isAdmin')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({id:data.id, name:data.full_name, isAdmin: data.isAdmin} , process.env.SECRET_KEY, {
            expiresIn: '1h'
        });

        console.log(token);
        

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict' 
        });

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
            email: data.email,
            full_name: data.full_name,
            },
            token
        });
            
                    
    } catch (error) {
        console.error("Error interno:", error);
        return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});


app.get('/protected', async (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        res.status(200).json({
            message: 'Acceso autorizado',
            isAdmin: data.isAdmin
        });
    } catch (error) {
        res.status(403).json({ message: 'Acceso no autorizado' });
    }
});



app.get('/publication', async (req, res) => {
    const { data, error } = await supabase.from('publication').select('*');

    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener publicaciones' });
    }
    console.log(data)

    res.status(200).json(data); // Solo retornamos los datos sin el mensaje adicional
});

app.post('/postPublication', async (req, res) => {
    const { newPostTitle, newPostContent, fullName } = req.body;

    if (!newPostTitle || !newPostContent || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        const { data, error } = await supabase
            .from('publication')
            .insert({ title: newPostTitle, content: newPostContent, user: fullName });

        if (error) {
            console.error('Error al insertar la publicación:', error);
            return res
                .status(500)
                .json({ message: 'Error al registrar la publicación', details: error.message });
        }

        return res.status(201).json({ message: 'Publicación registrada con éxito', data });
    } catch (error) {
        console.error('Error interno:', error);
        return res
            .status(500)
            .json({ message: 'Error al registrar la publicación', details: error.message });
    }
});

app.post('/createQuiz', async (req, res) => {
    //const { Title, Description, preguntas } = req.body;
    const Title = req.body.titulo;
    const Description = req.body.descripcion;
    const preguntas = req.body.preguntas;
    console.log("Data received:");
    console.log({ Title, Description, preguntas });

    try {
        // Insert into Quiz table
        const { data: quizData, error: quizError } = await supabase
            .from('Quiz')
            .insert([{ Title, Description }])
            .select('id');

        if (quizError) {
            console.error("Error inserting data into Quiz table:", quizError);
            return res.status(500).json({ message: "Error inserting data into Quiz table", error: quizError });
        }

        const quizId = quizData[0]?.id;
        console.log("Quiz inserted successfully with ID:", quizId);

        // Insert questions into Questions table
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
            return res.status(500).json({ message: "Error inserting questions", error: questionsError });
        }

        console.log("Questions inserted successfully:", questionsInserted);

        // Insert options into Options table
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
            return res.status(500).json({ message: "Error inserting options", error: optionsError });
        }

        console.log("Options inserted successfully");
        res.status(200).json({ message: "Quiz, questions, and options created successfully", quizId });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Unexpected error occurred", error: err.message });
    }
});




app.post('/deletePublication', async (req, res) => {
    const id = req.body.id;

    // Verifica que el ID esté presente
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const { error } = await supabase
            .from('publication')
            .delete()
            .eq('id', id);
        if (error) {
            throw error;
        }
        res.status(200).json({ message: 'Publicacion eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la publicacion:', error.message);
        res.status(500).json({ error: 'Failed to delete publication' });
    }
});


app.post('/comments', async (req, res) => {
    const { id } = req.body;

    // Obtener los comentarios de la publicación
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id_Publication', id);

    if (error) {
        return res.status(500).json({ error: 'Error al obtener comentarios' });
    }

    // Iterar sobre los comentarios y obtener el full_name de cada usuario
    const commentsWithUser = await Promise.all(data.map(async (comment) => {
        // Obtener los datos del usuario basado en el id_user del comentario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', comment.id_user);

        if (userError) {
            console.error('Error al obtener el full_name:', userError);
            comment.full_name = null;
        } else {
            // Comprobar si se obtuvo al menos un usuario
            if (userData && userData.length > 0) {
                comment.full_name = userData[0].full_name;
            } else {
                comment.full_name = 'Usuario no encontrado'; // O algún valor por defecto
            }
        }

        return comment;  // Retornamos el comentario con el full_name
    }));

    // Enviar los comentarios con el nombre de usuario
    res.status(200).json(commentsWithUser);
});

app.post('/addComment', async (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);

        const userId = data.id; 

        console.log('User ID:', userId);

        const { content, postId } = req.body;

        const { error } = await supabase
            .from('comments')
            .insert([
                {
                    content,
                    id_user: userId,  // Asociar el comentario con el 'id' del usuario
                    id_Publication: postId,
                    Date: new Date().toISOString(),  // Fecha del comentario
                }
            ]);

        if (error) {
            console.error('Error al agregar comentario:', error);
            return res.status(500).json({ message: 'Error al agregar comentario' });
        }

        res.status(200).json({ message: 'Comentario agregado correctamente', userId });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
});

app.post('/deleteComments', async(req,res)=>{
    const id_Publication = req.body.id
    console.log(id_Publication);

    try {
        const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id_Publication', id_Publication)
        if (error) {
            throw error;
        }
        res.status(200).json({ message: 'Comentarios eliminados exitosamente' });
    } catch (error) {
        console.error('Error al eliminar los comentarios:', error.message);
        res.status(500).json({ error: 'Falla al eliminar los comentarios' });
    }
    
})


app.get('/logout', (req, res)=>{
    res.clearCookie('access_token',{
        httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict' 
    })
    res.status(200).json({ message: "Logout exitoso" });

})

app.get('/type', async (req, res) => {
    
    let { data: type, error } = await supabase
    .from('type')
    .select('*')

    if(error){
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener tipos' });
    }
    console.log(type)

    res.status(200).json(type); 
})


app.post('/addTopic', async (req, res) => {
    const { titulo, descripcion, contenido, fecha, tipo } = req.body;

    const { data, error } = await supabase
        .from('topics')
        .insert([
            { 
                Title: titulo, 
                Description: descripcion, 
                Content: contenido, 
                Date: fecha, 
                Id_type: tipo 
            }
        ])
        .select();

    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al agregar el tema' });
    }

    res.status(200).json(data);
});

app.get('/topics', async (req, res) => {
    try {
        // Realizamos una consulta con una unión entre 'topics' y 'type'
        const { data: topics, error } = await supabase
            .from('topics')
            .select(`
                id,
                Title,
                Description,
                Content,
                Date,
                type:Id_type (name)  // Esto trae el nombre del tipo (en lugar del ID)
            `);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener temas' });
        }

        // Enviar los temas con el nombre del tipo
        res.status(200).json(topics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/deleteTopic', async (req, res) => {
    const idDelete = req.body.id
    console.log(idDelete);
    try{
        const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', idDelete)
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al eliminar el tema' });
        }
        res.status(200).json({ message: 'Tema eliminado exitosamente' });
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
})



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Servidor en ejecución en http://localhost:5000');
});