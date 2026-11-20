const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMessState,
  updateMessMember,
  updateWeeklyMenu,
  updateBazaarPhase,
  updateDailyMeal,
  addUtilityBill,
  updateUtilityBill,
  deleteUtilityBill
} = require('../controllers/messController');

router.get('/state', verifyToken, getMessState);
router.put('/members/:id', verifyToken, updateMessMember);
router.put('/menu/:dayIndex', verifyToken, updateWeeklyMenu);
router.put('/bazaar-phases/:phaseNumber', verifyToken, updateBazaarPhase);
router.put('/meals', verifyToken, updateDailyMeal);
router.post('/bills', verifyToken, addUtilityBill);
router.put('/bills/:id', verifyToken, updateUtilityBill);
router.delete('/bills/:id', verifyToken, deleteUtilityBill);

module.exports = router;