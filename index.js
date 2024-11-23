const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let transactions = [];

// Routes
// 1. Create a new transaction
app.post('/api/transactions', (req, res) => {
    const { amount, transaction_type, user_id } = req.body;

    if (!amount || !transaction_type || !user_id) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const transaction = {
        transaction_id: uuidv4(),
        amount,
        transaction_type,
        user_id,
        status: 'PENDING',
        timestamp: new Date().toISOString()
    };

    transactions.push(transaction);
    res.status(201).json(transaction);
});

// 2. Get transactions for a specific user
app.get('/api/transactions', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required.' });
    }

    const userTransactions = transactions.filter(t => t.user_id === user_id);
    res.json(userTransactions);
});

// 3. Get transaction by ID
app.get('/api/transactions/:transaction_id', (req, res) => {
    const { transaction_id } = req.params;

    const transaction = transactions.find(t => t.transaction_id === transaction_id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json(transaction);
});

// 4. Update transaction status
app.put('/api/transactions/:transaction_id', (req, res) => {
    const { transaction_id } = req.params;
    const { status } = req.body;

    if (!['COMPLETED', 'FAILED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }

    const transaction = transactions.find(t => t.transaction_id === transaction_id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found.' });
    }

    transaction.status = status;
    res.json(transaction);
});


// 5. Delete transaction by ID
app.delete('/api/transactions/:transaction_id', (req, res) => {
    const { transaction_id } = req.params;

    const index = transactions.findIndex(t => t.transaction_id === transaction_id);
    if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found.' });
    }

    transactions.splice(index, 1);
    res.status(204).send();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


