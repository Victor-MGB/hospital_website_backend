const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User');

const router = express.Router();

// GET /patients/:patientId/billing-info
router.get('/patients/:patientId/billing-info', async (req, res) => {
    const { patientId } = req.params;
  
    try {
      const patient = await User.findById(patientId).select('billing_info');
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
  
      res.json(patient.billing_info);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching billing information', error });
    }
  });
  

// PUT /patients/:patientId/billing-info
router.put('/patients/:patientId/billing-info', async (req, res) => {
    const { patientId } = req.params;
    const updates = req.body;
  
    try {
      const patient = await User.findById(patientId);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
  
      Object.assign(patient.billing_info, updates);
      await patient.save();
  
      res.json(patient.billing_info);
    } catch (error) {
      res.status(500).json({ message: 'Error updating billing information', error });
    }
  });
  

module.exports = router;
