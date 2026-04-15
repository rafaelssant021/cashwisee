const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const currencyRoutes = require('./routes/currency');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/currency', currencyRoutes);

app.get('/', (req, res) => res.json({message: 'Fintrack api rodando'}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));