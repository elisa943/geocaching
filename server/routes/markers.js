const express = require('express');
const mongoose = require('mongoose');
const Marker = require('../models/Marker');

const router = express.Router();

// GET all markers
router.get('/', async (req, res) => {
    const markers = await Marker.find();
    res.json(markers);
});

// POST new marker
router.post('/', async (req, res) => {
    const marker = new Marker(req.body);
    await marker.save();
    res.status(201).json(marker);
});

// PUT update marker
router.put('/:id', async (req, res) => {
    const updated = await Marker.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
});

// DELETE marker
router.delete('/:id', async (req, res) => {
    await Marker.findOneAndDelete({ id: req.params.id });
    res.status(204).end();
});

module.exports = router;
