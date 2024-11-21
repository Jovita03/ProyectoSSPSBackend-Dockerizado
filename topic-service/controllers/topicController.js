const topicService = require('../services/topicService');

const obtenerTipos = async (req, res) => {
    try {
        const tipos = await topicService.obtenerTipos();
        res.status(200).json(tipos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener tipos' });
    }
};

const agregarTema = async (req, res) => {
    const { titulo, descripcion, contenido, fecha, tipo } = req.body;

    try {
        const nuevoTema = await topicService.agregarTema(titulo, descripcion, contenido, fecha, tipo);
        res.status(200).json(nuevoTema);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al agregar el tema' });
    }
};

const obtenerTemas = async (req, res) => {
    try {
        const temas = await topicService.obtenerTemas();
        res.status(200).json(temas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener temas' });
    }
};

const eliminarTema = async (req, res) => {
    const idDelete = req.body.id;

    try {
        await topicService.eliminarTema(idDelete);
        res.status(200).json({ message: 'Tema eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al eliminar el tema' });
    }
};

module.exports = {
    obtenerTipos,
    agregarTema,
    obtenerTemas,
    eliminarTema
};