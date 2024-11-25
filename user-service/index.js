const express = require('express');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: "*"
}));
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log("funcionando");
});