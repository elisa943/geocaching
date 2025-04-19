const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// PUT update user
router.put('/:id', async (req, res) => {
    const updated = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { points: req.body.points } },
        { new: true }
    );
    if (!updated) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
}
);

// GET all users
router.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
    }
);

module.exports = router;