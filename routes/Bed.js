const express = require('express');
const router = express.Router();
const Bed = require('../model/BedSchema'); // Adjust the path as necessary
require('dotenv').config();

// Endpoint to create a new bed (only for admins)
router.post('/beds', async (req, res) => {
  try {
    const { bedNo, roomNo, status } = req.body;

    // Check if the bedNo already exists
    const existingBed = await Bed.findOne({ bedNo });
    if (existingBed) {
      return res.status(400).json({ message: 'Bed number already exists' });
    }

    // Create a new bed
    const newBed = new Bed({
      bedNo,
      roomNo,
      status: status || 'available'
    });

    await newBed.save();
    res.status(201).json(newBed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to retrieve all available beds
router.get('/beds', async (req, res) => {
  try {
    const beds = await Bed.find({ status: 'available' });
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
