const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// READ all (newest first)
router.get('/', async (req, res) => {
  try {
    res.json(await Expense.find().sort({ date: -1, createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Expense.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
