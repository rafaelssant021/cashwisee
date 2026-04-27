const pool = require('../config/db');

const getTrasactions = async (req, res) => {
    const { start, end, category_id, type } = req.query;

    let query = `
        SELECT t.*, c.name as category_name, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
    `;

    const params = [req.user.id];
    if (start) { query += ' AND t.date >= ?'; params.push(start); }
    if (end) { query += ' AND t.date <= ?'; params.push(end); }
    if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }
    if (type) { query += ' AND t.type = ?'; params.push(type); }

    query += ' ORDER BY t.date DESC';

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

const getSummary = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance
            FROM transactions WHERE user_id = ?`,
            [req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
};

const createTransaction = async (req, res) => {
    const { type, amount, description, date, category_id } = req.body;

    if (!type || !amount || !date)
        return res.status(400).json({ error: 'Tipo, valor e data são obrigatórios' });

    if (!['income', 'expense'].includes(type))
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });

    try {
        const [result] = await pool.query(
            'INSERT INTO transactions (user_id, type, amount, description, date, category_id) VALUES (?,?,?,?,?,?)',
            [req.user.id, type, amount, description, date, category_id || null]
        );
        res.status(201).json({ id: result.insertId, type, amount, description, date, category_id });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
};

const updateTransaction = async (req, res) => {
    const { type, amount, description, date, category_id } = req.body;
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            `UPDATE transactions
            SET type = ?, amount = ?, description = ?, date = ?, category_id = ?
            WHERE id = ? AND user_id = ?`,
            [type, amount, description, date, category_id || null, id, req.user.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Transação não encontrada' });

        res.json({ id, type, amount, description, date, category_id });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Transação não encontrada' });

        res.json({ message: 'Transação excluída' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
};

module.exports = { getTrasactions, getSummary, createTransaction, updateTransaction, deleteTransaction };
