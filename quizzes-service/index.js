const express = require('express');
const quizRoutes = require('./routes/quizRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5004; 

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use('/quizzes', quizRoutes); 

app.listen(PORT, () => {
    
});