const express = require('express');
const publicationRoutes = require('./routes/publicationRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 5003;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: "*"
}));
app.use('/publicaciones', publicationRoutes);

app.listen(PORT, () => {
    console.log(`Servicio de publicaciones en ejecución en este puerto ${PORT}`);
});