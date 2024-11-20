// users-service/index.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Importamos las rutas de usuarios

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// Usamos las rutas de usuarios para manejar las peticiones a /api/users
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Microservicio de usuarios corriendo en el puerto ${port}`);
});