const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const obtenerUsuarioPorEmail = async (email) => {
        try {
            const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, created_at, isAdmin, is_block')
            .eq('email', email)
            .single();

            if (error) {
            console.error("Error en la consulta:", error);
            throw new Error('Error al obtener datos de Supabase');
            }

            return data;
        } catch (error) {
            console.error("Error interno:  ", error);
            throw new Error('Error al obtener datos de Supabase');
        }
    };

// Listar usuarios
const listarUsuarios = async () => {
    try {
        const { data: users, error } = await supabase
        .from('users')
        .select('id,full_name, email, is_block');

        if (error) {
        console.error("Error al obtener la lista de usuarios:", error);
        throw new Error('Error al obtener la lista de usuarios.');
        }

        return users;
    } catch (error) {
        console.error("Error interno al listar usuarios:", error);
        throw new Error('Error al obtener la lista de usuarios.');
    }
};

// Bloquear/desbloquear usuario
const toggleBlockUsuario = async (id, is_block) => {
    try {
        const { data, error } = await supabase
        .from('users')
        .update({ is_block: is_block })
        .eq('id', id)
        .select();

        if (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        throw new Error('Error al actualizar el estado del usuario.');
        }

        if (!data || data.length === 0) {
        return { success: false };
        }

        return { success: true };
    } catch (error) {
        console.error("Error interno al actualizar el estado del usuario:", error);
        throw new Error('Error al actualizar el estado del usuario.');
    }
};

module.exports = {
    obtenerUsuarioPorEmail,
    listarUsuarios,
    toggleBlockUsuario
};