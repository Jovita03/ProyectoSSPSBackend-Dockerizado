const express = require('express');
const publicationRoutes = require('./routes/publicationRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use('/publicaciones', publicationRoutes);

app.listen(PORT, () => {
    console.log(`Servicio de publicaciones en ejecución en http://localhost:${PORT}`);
});