const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const obtenerPublicaciones = async () => {
    const { data, error } = await supabase.from('publication').select('*');

    if (error) {
        console.error(error);
        throw new Error('Error al obtener publicaciones');
    }

    return data;
};

const crearPublicacion = async (newPostTitle, newPostContent, fullName) => {
    try {
        const { data, error } = await supabase
            .from('publication')
            .insert({ title: newPostTitle, content: newPostContent, user: fullName });

        if (error) {
            console.error('Error al insertar la publicación:', error);
            throw new Error('Error al registrar la publicación');
        }

        return data;
    } catch (error) {
        console.error('Error interno:', error);
        throw new Error('Error al registrar la publicación');
    }
};

const eliminarPublicacion = async (id) => {
    try {
        const { error } = await supabase
            .from('publication')
            .delete()
            .eq('id', id);
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error al eliminar la publicacion:', error.message);
        throw new Error('Failed to delete publication');
    }
};

const obtenerComentarios = async (id) => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id_Publication', id);

    if (error) {
        throw new Error('Error al obtener comentarios');
    }

    const commentsWithUser = await Promise.all(data.map(async (comment) => {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', comment.id_user);

        if (userError) {
            console.error('Error al obtener el full_name:', userError);
            comment.full_name = null;
        } else {
            if (userData && userData.length > 0) {
                comment.full_name = userData[0].full_name;
            } else {
                comment.full_name = 'Usuario no encontrado';
            }
        }

        return comment;
    }));

    return commentsWithUser;
};

const agregarComentario = async (content, userId, postId) => {
    try {
        const { error } = await supabase
            .from('comments')
            .insert([
                {
                    content,
                    id_user: userId,
                    id_Publication: postId,
                    Date: new Date().toISOString(),
                }
            ]);

        if (error) {
            console.error('Error al agregar comentario:', error);
            throw new Error('Error al agregar comentario');
        }
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        throw new Error('Error al agregar comentario');
    }
};

const eliminarComentarios = async (id_Publication) => {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id_Publication', id_Publication)
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error al eliminar los comentarios:', error.message);
        throw new Error('Falla al eliminar los comentarios');
    }
}

module.exports = {
    obtenerPublicaciones,
    crearPublicacion,
    eliminarPublicacion,
    obtenerComentarios,
    agregarComentario,
    eliminarComentarios
}