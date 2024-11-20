const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Registrar un nuevo usuario
const registerUser = async (email, password, fullName) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase.from('users').insert([{
            email,
            password: hashedPassword,
            full_name: fullName,
            isAdmin: false
        }]);

        if (error) throw error;

        return { user: data[0] };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Verificar las credenciales de un usuario
const verifyUser = async (email, password) => {
    try {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

        if (error || !data) {
            throw new Error('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        return { user: data };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { registerUser, verifyUser };