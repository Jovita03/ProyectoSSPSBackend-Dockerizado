const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const obtenerTipos = async () => {
    const { data: type, error } = await supabase
        .from('type')
        .select('*');

    if (error) {
        console.error(error);
        throw new Error('Error al obtener tipos');
    }

    return type;
};

const agregarTema = async (titulo, descripcion, contenido, fecha, tipo) => {
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
        throw new Error('Error al agregar el tema');
    }

    return data;
};

const obtenerTemas = async () => {
    const { data: topics, error } = await supabase
        .from('topics')
        .select(`
                id,
                Title,
                Description,
                Content,
                Date,
                type:Id_type (name)
            `);

    if (error) {
        console.error(error);
        throw new Error('Error al obtener temas');
    }

    return topics;
};

const eliminarTema = async (idDelete) => {
        const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', idDelete);

    if (error) {
        console.error(error);
        throw new Error('Error al eliminar el tema');
    }
};

module.exports = {
    obtenerTipos,
    agregarTema,
    obtenerTemas,
    eliminarTema
};