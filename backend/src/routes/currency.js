const express = require('express');
const https = require('https');
const router = express.Router();

const QUOTES_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';

const fetchJson = (url) => new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
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

    request.setTimeout(5000, () => {
        request.destroy(new Error('Currency API timeout'));
    });
});

const formatQuotes = (data) => ({
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

router.get('/', async (req, res) => {
    try {
        const data = await fetchJson(QUOTES_URL);
        res.json(formatQuotes(data));
    } catch (err) {
        console.error('Erro ao buscar cotacoes:', {
            message: err.message,
            code: err.code,
        });

        res.status(502).json({ error: 'Erro ao buscar cotacoes' });
    }
});

module.exports = router;
