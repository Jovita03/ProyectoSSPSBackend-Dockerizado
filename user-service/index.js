const express = require('express');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Servicio de usuarios en ejecución en http://localhost:${PORT}`);
});