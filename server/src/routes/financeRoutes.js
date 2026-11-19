const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    getUserData,
    updateBudget,
    addTransaction,
    deleteTransaction,
    updateCgpa
} = require('../controllers/financeController');

router.get('/state', verifyToken, getUserData);
router.put('/budget', verifyToken, updateBudget);
router.post('/transactions', verifyToken, addTransaction);
router.delete('/transactions/:id', verifyToken, deleteTransaction);
router.put('/cgpa', verifyToken, updateCgpa);

module.exports = router;