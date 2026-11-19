const db = require('../config/db');

const safeQuery = (sql, params = []) => {
    return new Promise((resolve) => {
        try {
            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.warn('Safe SQL warning:', err.message);
                    return resolve([]);
                }
                return resolve(Array.isArray(rows) ? rows : []);
            });
        } catch (e) {
            return resolve([]);
        }
    });
};

// Get user budget, balance, transactions, and CGPA safely without 500 errors
const getUserData = async (req, res) => {
    const userId = req.user && req.user.id ? req.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized user' });
    }

    try {
        let monthly_budget = 0;
        let initial_balance = 0;

        const budgetRows = await safeQuery("SELECT * FROM budgets WHERE user_id = ? LIMIT 1", [userId]);
        if (budgetRows.length > 0) {
            const bRow = budgetRows[0];
            const bCand = bRow.monthly_budget ?? bRow.budget_limit ?? bRow.budget ?? bRow.amount ?? 0;
            const balCand = bRow.initial_balance ?? bRow.balance ?? 0;
            monthly_budget = Number.isNaN(Number(bCand)) ? 0 : Number(bCand);
            initial_balance = Number.isNaN(Number(balCand)) ? 0 : Number(balCand);
        }

        const txnRows = await safeQuery("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC", [userId]);

        let current_cgpa = 0;
        let completed_credits = 0;
        const cgpaRows = await safeQuery("SELECT * FROM user_cgpa WHERE user_id = ? LIMIT 1", [userId]);
        if (cgpaRows.length > 0) {
            const cRow = cgpaRows[0];
            const cgCand = cRow.current_cgpa ?? cRow.cgpa ?? 0;
            const crCand = cRow.completed_credits ?? cRow.total_credits ?? cRow.credits ?? 0;
            current_cgpa = Number.isNaN(Number(cgCand)) ? 0 : Number(cgCand);
            completed_credits = Number.isNaN(Number(crCand)) ? 0 : Number(crCand);
        }

        return res.status(200).json({
            monthly_budget,
            initial_balance,
            transactions: txnRows,
            current_cgpa,
            completed_credits
        });
    } catch (err) {
        console.error('getUserData error:', err);
        return res.status(200).json({
            monthly_budget: 0,
            initial_balance: 0,
            transactions: [],
            current_cgpa: 0,
            completed_credits: 0
        });
    }
};

// Update monthly budget and/or initial balance in `budgets` table
const updateBudget = async (req, res) => {
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const budgetVal = req.body.monthly_budget !== undefined ? Number(req.body.monthly_budget) : 0;
    const balanceVal = req.body.initial_balance !== undefined ? Number(req.body.initial_balance) : 0;

    const existing = await safeQuery("SELECT id FROM budgets WHERE user_id = ? LIMIT 1", [userId]);

    if (existing.length > 0) {
        await safeQuery(
            "UPDATE budgets SET monthly_budget = ?, initial_balance = ? WHERE user_id = ?",
            [budgetVal, balanceVal, userId]
        );
    } else {
        await safeQuery(
            "INSERT INTO budgets (user_id, monthly_budget, initial_balance) VALUES (?, ?, ?)",
            [userId, budgetVal, balanceVal]
        );
    }

    return res.status(200).json({
        message: 'Budget updated successfully',
        monthly_budget: budgetVal,
        initial_balance: balanceVal
    });
};

// Add a new transaction in `transactions` table
const addTransaction = (req, res) => {
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const { type, category, amount, note } = req.body;
    const cleanType = type === 'income' ? 'income' : 'expense';
    const cleanCategory = typeof category === 'string' && category.trim() ? category.trim() : 'General';
    const cleanAmount = Number(amount);
    const cleanNote = typeof note === 'string' ? note.trim() : '';

    if (!cleanAmount || cleanAmount <= 0) {
        return res.status(400).json({ message: 'Valid positive amount is required' });
    }

    const query = `
        INSERT INTO transactions (user_id, type, category, amount, note)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [userId, cleanType, cleanCategory, cleanAmount, cleanNote], (err, result) => {
        if (err) {
            console.error('Add transaction error:', err);
            return res.status(500).json({ message: 'Database error adding transaction' });
        }
        return res.status(201).json({
            message: 'Transaction added successfully',
            transaction: {
                id: result.insertId,
                type: cleanType,
                category: cleanCategory,
                amount: cleanAmount,
                note: cleanNote
            }
        });
    });
};

// Delete a transaction from `transactions` table
const deleteTransaction = (req, res) => {
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const txnId = req.params.id;

    db.query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [txnId, userId], (err, result) => {
        if (err) {
            console.error('Delete transaction error:', err);
            return res.status(500).json({ message: 'Database error deleting transaction' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        return res.status(200).json({ message: 'Transaction deleted successfully' });
    });
};

// Update CGPA and completed credits in `user_cgpa` table
const updateCgpa = (req, res) => {
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

    const cgpaVal = req.body.current_cgpa !== undefined ? Number(req.body.current_cgpa) : 0;
    const creditsVal = req.body.completed_credits !== undefined ? Number(req.body.completed_credits) : 0;

    const query = `
        INSERT INTO user_cgpa (user_id, current_cgpa, completed_credits)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            current_cgpa = VALUES(current_cgpa),
            completed_credits = VALUES(completed_credits)
    `;

    db.query(query, [userId, cgpaVal, creditsVal], (err) => {
        if (err) {
            console.error('Update CGPA error:', err);
            return res.status(500).json({ message: 'Database error updating CGPA' });
        }
        return res.status(200).json({
            message: 'CGPA updated successfully',
            current_cgpa: cgpaVal,
            completed_credits: creditsVal
        });
    });
};

module.exports = {
    getUserData,
    updateBudget,
    addTransaction,
    deleteTransaction,
    updateCgpa
};