const pool = require('../config/db');

const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar categorias'});
    }
};

const createCategory = async (req, res) => {
    const {name, color} = req.body;
    const finalColor = color || '#6366f1'

    if(!name)
        return res.status(400).json({error: 'Nome é obrigatorio'});

    try{
        const [result] = await pool.query(
            'INSERT INTO categories (user_id, name, color) VALUES (?,?,?)',
            [req.user.id, name, finalColor]
        );
        res.status(201).json({id: result.insertId, name, color: finalColor});
    } catch (err) {
        res.status(500).json({error: 'Erro ao criar categoria'});
    }
};

const updateCategory = async (req, res) => {
    const {name, color} = req.body;
    const {id} = req.params;

    try{
        const [result] = await pool.query(
            'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
            [name, color, id, req.user.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({error: 'Categoria nao encontrada'});

        res.json({id, name, color});
    } catch (err){
        res.status(500).json({error: 'Erro ao atualizar categoria'});
    }
};

const deleteCategory = async (req, res) =>{
    const {id} = req.params;

    try{
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.afftectedRows === 0)
            return res.status(404).json({error: 'Categoria nao encontrada'});

        res.json({message: 'Categoria deletada'});
    } catch (arr) {
        res.status(500).json({error: 'Erro ao deletar categoria'});
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory};
