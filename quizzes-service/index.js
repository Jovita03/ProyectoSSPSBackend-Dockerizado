const express = require('express');
const quizRoutes = require('./routes/quizRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5004; 

app.use(express.json());
app.use(cors({
    origin: '* ', 
    credentials: true,
    methods: "*"
}));

app.use('/quizzes', quizRoutes); 

app.listen(PORT, () => {
    console.log("funcionandoooo");
    
});