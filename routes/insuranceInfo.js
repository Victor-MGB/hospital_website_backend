const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User');

const router = express.Router();

// GET /patients/:patientId/insurance-info
router.get('/patients/:patientId/insurance-info', async (req, res) => {
    const { patientId } = req.params;
  
    try {
      const patient = await User.findById(patientId).select('insurance_info');
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
  
      res.json(patient.insurance_info);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching insurance information', error });
    }
  });
  

  // PUT /patients/:patientId/insurance-info
router.put('/patients/:patientId/insurance-info', async (req, res) => {
    const { patientId } = req.params;
    const updates = req.body;
  
    try {
      const patient = await User.findById(patientId);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
  
      Object.assign(patient.insurance_info, updates);
      await patient.save();
  
      res.json(patient.insurance_info);
    } catch (error) {
      res.status(500).json({ message: 'Error updating insurance information', error });
    }
  });
  
module.exports = router;
