const publicationService = require('../services/publicationService');

const obtenerPublicaciones = async (req, res) => {
    try {
        const publicaciones = await publicationService.obtenerPublicaciones();
        res.status(200).json(publicaciones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener publicaciones' });
    }
};

const crearPublicacion = async (req, res) => {
    const { newPostTitle, newPostContent, fullName } = req.body;

    if (!newPostTitle || !newPostContent || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        const data = await publicationService.crearPublicacion(newPostTitle, newPostContent, fullName);
        return res.status(201).json({ message: 'Publicación registrada con éxito', data });
    } catch (error) {
        console.error('Error al insertar la publicación:', error);
        return res
            .status(500)
            .json({ message: 'Error al registrar la publicación', details: error.message });
    }
};


const eliminarPublicacion = async (req, res) => {
    const id = req.body.id;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        await publicationService.eliminarPublicacion(id);
        res.status(200).json({ message: 'Publicacion eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la publicacion:', error.message);
        res.status(500).json({ error: 'Failed to delete publication' });
    }
};

const obtenerComentarios = async (req, res) => {
    const { id } = req.body;

    try {
        const commentsWithUser = await publicationService.obtenerComentarios(id);
        res.status(200).json(commentsWithUser);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener comentarios' });
    }
};

const agregarComentario = async (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    try {
        const response = await axios.get('http://localhost:5001/auth/protected', { 
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const userId = response.data.user.id; 

    const { content, postId } = req.body;

    await publicationService.agregarComentario(content, userId, postId);
        res.status(200).json({ message: 'Comentario agregado correctamente', userId });
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        return res.status(500).json({ message: 'Error al agregar comentario' });
    }
    };

const eliminarComentarios = async (req, res) => {
    const id_Publication = req.body.id
    console.log(id_Publication);

    try {
        await publicationService.eliminarComentarios(id_Publication);
        res.status(200).json({ message: 'Comentarios eliminados exitosamente' });
    } catch (error) {
        console.error('Error al eliminar los comentarios:', error.message);
        res.status(500).json({ error: 'Falla al eliminar los comentarios' });
    }

}

module.exports = {
    obtenerPublicaciones,
    crearPublicacion,
    eliminarPublicacion,
    obtenerComentarios,
    agregarComentario,
    eliminarComentarios
};