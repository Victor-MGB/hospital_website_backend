const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User'); // Ensure this path is correct
const { body, validationResult } = require('express-validator'); // For input validation

const router = express.Router();

// Get Emergency Contact Information
router.get('/patients/:patientId/emergency-contact', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId).select('emergency_contact');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({
      userId: patientId,
      emergencyContact: patient.emergency_contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency contact information', error: error.message });
  }
});

// Update Emergency Contact Information
router.put('/patients/:patientId/emergency-contact', 
  // Input validation middleware
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('relationship').optional().isString().withMessage('Relationship must be a string'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('email').optional().isEmail().withMessage('Email must be a valid email address')
  ],
  async (req, res) => {
    const { patientId } = req.params;
    const updates = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    try {
      const patient = await User.findById(patientId);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });

      // Update only specified fields
      Object.keys(updates).forEach(key => {
        if (patient.emergency_contact.hasOwnProperty(key)) {
          patient.emergency_contact[key] = updates[key];
        }
      });

      await patient.save();

      res.json({
        userId: patientId,
        updatedEmergencyContact: patient.emergency_contact
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating emergency contact information', error: error.message });
    }
  }
);

module.exports = router;
