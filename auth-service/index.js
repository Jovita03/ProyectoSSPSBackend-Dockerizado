const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require( './routes/authRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: '*',
        credentials: true,
        methods: "*"
    }));

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
}
)