const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User'); // Ensure this path is correct

const router = express.Router();

// Get patient details
router.get('/patients/:patientId', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient details', error });
  }
});

// Update patient details
router.put('/patients/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  try {
    const patient = await User.findByIdAndUpdate(patientId, updates, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient details', error });
  }
});

// Delete patient record
router.delete('/patients/:patientId', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findByIdAndDelete(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({ message: 'Patient record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient record', error });
  }
});

module.exports = router;
