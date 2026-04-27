const express = require('express');
const https = require('https');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const fetchJson = (url) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        let rawData = '';

        response.on('data', (chunk) => {
            rawData += chunk;
        });

        response.on('end', () => {
            try {
                if (response.statusCode && response.statusCode >= 400) {
                    return reject(new Error(`Currency API responded with ${response.statusCode}`));
                }

                resolve(JSON.parse(rawData));
            } catch (error) {
                reject(error);
            }
        });
    }).on('error', reject);
});

router.get('/', auth, async (req, res) => {
    try {
        const data = await fetchJson('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL');

        res.json({
            USD: {
                name: 'Dólar',
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
