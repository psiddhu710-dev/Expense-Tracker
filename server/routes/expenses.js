const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const router = express.Router();

const transactionFields = ['title', 'amount', 'category', 'type', 'date', 'notes'];

function getTransactionData(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.status = 400;
    throw error;
  }

  const data = {};
  for (const field of transactionFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) data[field] = body[field];
  }
  if (!Object.prototype.hasOwnProperty.call(data, 'title') && body.description !== undefined) {
    data.title = body.description;
  }
  return data;
}

function sendError(res, error) {
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: error.message });
  }
  console.error('Transaction request failed:', error.message);
  return res.status(500).json({ message: 'Unable to complete the transaction request' });
}

// READ all (newest first)
router.get('/', async (req, res) => {
  try {
    res.json(await Expense.find().sort({ date: -1, createdAt: -1 }));
  } catch (e) {
    sendError(res, e);
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Expense.create(getTransactionData(req.body)));
  } catch (e) {
    sendError(res, e);
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    transaction.set(getTransactionData(req.body));
    const updated = await transaction.save();
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (e) {
    sendError(res, e);
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    sendError(res, e);
  }
});

module.exports = router;
