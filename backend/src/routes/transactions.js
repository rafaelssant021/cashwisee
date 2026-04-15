const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {getTrasactions, getSummary, createTransaction, updateTransaction, deleteTransaction} = require('../controllers/transactionController');

router.use(auth);

router.get('/summary', getSummary);
router.get('/', getTrasactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;