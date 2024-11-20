const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require( './controllers/authController');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }));

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
}
)