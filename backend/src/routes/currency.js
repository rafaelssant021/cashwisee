const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
    try{
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL');
        const data = await response.json();

        res.json({
            USD: {
                name: 'Dolar',
                buy: parseFloat(data.USDBRL.bid).toFixed(2),
                variation: parseFloat(data.USDBRL.pctChange).toFixed(2),
            },
            EUR: {
                name: 'Euro',
                buy: parseFloat(data.EURBRL.bid).toFixed(2),
                variation: parseFloat(data.EURBRL.pctChange).toFixed(2),
            },
            BTC: {
                name: 'Bitcoin',
                buy: parseFloat(data.BTCBRL.bid).toFixed(2),
                variation: parseFloat(data.BTCBRL.pctChange).toFixed(2),
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar cotações' });
    }
});

module.exports = router;