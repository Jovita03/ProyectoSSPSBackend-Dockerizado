const userService = require('../services/userService');

const obtenerUsuario = async (req, res) => {
    try {
        const email = req.params.email;
        if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido' });
        }

        const user = await userService.obtenerUsuarioPorEmail(email);
        if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json(user);
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return res.status(500).json({ message: 'Error al obtener datos de Supabase', error: error.message });
    }
};

// Listar usuarios
const listarUsuarios = async (req, res) => {
    try {
        const users = await userService.listarUsuarios();
        return res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente.',
        users: users
        });
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        return res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de usuarios.',
        error: error.message
        });
    }
};

// Bloquear/desbloquear usuario
const toggleBlockUsuario = async (req, res) => {
    try {
        const { id, is_block } = req.body;
        const result = await userService.toggleBlockUsuario(id, is_block);

        if (result.success) {
        return res.status(200).json({
            success: true,
            message: 'Estado de usuario actualizado correctamente.',
        });
        } else {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado.',
        });
        }
    } catch (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado del usuario.',
        error: error.message,
        });
    }
};

module.exports = {
    obtenerUsuario,
    listarUsuarios,
    toggleBlockUsuario
};