const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {getCategories, createCategory, updateCategory, deleteCategory} =
    require('../controllers/categoryController');

router.use(auth);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;