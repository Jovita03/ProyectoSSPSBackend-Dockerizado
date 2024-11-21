const express = require('express');
const topicRoutes = require('./routes/topicRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/temas', topicRoutes);

app.listen(PORT, () => {
    
});