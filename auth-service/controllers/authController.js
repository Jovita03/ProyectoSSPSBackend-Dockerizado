const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const registrarUsuario = async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ message: 'Todos los campos son necesarios' });
    }

    try {
        const { user } = await authService.registerUser(email, password, fullName);

        const token = tokenService.generateToken(user.id, user.full_name, user.isAdmin);

        res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60, // 1 hora
        sameSite: 'strict'
        });
        return res.status(201).json({ message: 'Usuario registrado exitosamente' });
        } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    };

    const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son necesarios' });
  }

  try {
    const { user } = await authService.verifyUser(email, password);

    const userResponse = await fetch(`http://user-service/users/${email}`);
    const userData = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error("Error al obtener datos del usuario desde user-service");
    }

    const token = tokenService.generateToken(user.id, user.full_name, user.isAdmin);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60, // 1 hora
      sameSite: 'strict'
    });

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        email: userData.email,
        full_name: userData.full_name,
        is_block: userData.is_block
      },
      token: token
    });
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return res.status(500).json({
      message: 'Error al obtener datos del usuario',
      error: error.message
    });
  }
};
      
      const rutaProtegida = (req, res) => {
        const token = req.cookies.access_token;
      
        if (!token) {
          return res.status(403).json({ message: 'Acceso no autorizado' });
        }
      
        try {
          const decoded = tokenService.verifyToken(token);
          return res.status(200).json({ message: 'Acceso autorizado', user: decoded });
        } catch (error) {
          return res.status(403).json({ message: 'Token no válido' });
        }
      };
    
      const cerrarSesion = (req, res) => {
        res.clearCookie('access_token', { 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        res.status(200).json({ message: "Logout exitoso" });
      };
      
      module.exports = {
        registrarUsuario,
        iniciarSesion,
        rutaProtegida,
        cerrarSesion  
      };