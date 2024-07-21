const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User'); // Ensure this path is correct

const router = express.Router();

// Middleware to handle common errors
const handleErrors = (res, message, error) => {
  console.error(`Error: ${message}`, error);
  res.status(500).json({ success: false, message, error: error.message });
};

// Get all billing stages for a patient
router.get('/patients/:patientId/billing-stages', async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await User.findById(patientId).select('billing_info.billing_stages');
    if (!patient || !patient.billing_info) {
      return res.status(404).json({ success: false, message: 'Patient or billing info not found' });
    }

    res.json({ success: true, billingStages: patient.billing_info.billing_stages });
  } catch (error) {
    handleErrors(res, 'Error fetching billing stages', error);
  }
});

// Add a new billing stage for a patient
router.post('/patients/:patientId/billing-stages', async (req, res) => {
  const { patientId } = req.params;
  const { stage, date, details, paid } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!patient.billing_info) {
      patient.billing_info = { billing_stages: [] };
    }

    const newBillingStage = { stage, date, details, paid };
    patient.billing_info.billing_stages.push(newBillingStage);
    await patient.save();

    res.status(201).json({ success: true, billingStage: newBillingStage });
  } catch (error) {
    handleErrors(res, 'Error adding billing stage', error);
  }
});

// Get details of a specific billing stage
router.get('/patients/:patientId/billing-stages/:stageId', async (req, res) => {
  const { patientId, stageId } = req.params;

  try {
    const patient = await User.findById(patientId).select('billing_info.billing_stages');
    if (!patient || !patient.billing_info) {
      return res.status(404).json({ success: false, message: 'Patient or billing info not found' });
    }

    const billingStage = patient.billing_info.billing_stages.id(stageId);
    if (!billingStage) {
      return res.status(404).json({ success: false, message: 'Billing stage not found' });
    }

    res.json({ success: true, billingStage });
  } catch (error) {
    handleErrors(res, 'Error fetching billing stage', error);
  }
});

// Update a specific billing stage
router.put('/patients/:patientId/billing-stages/:stageId', async (req, res) => {
  const { patientId, stageId } = req.params;
  const { stage, date, details, paid } = req.body;

  try {
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!patient.billing_info) {
      patient.billing_info = { billing_stages: [] };
    }

    const billingStage = patient.billing_info.billing_stages.id(stageId);
    if (!billingStage) {
      return res.status(404).json({ success: false, message: 'Billing stage not found' });
    }

    billingStage.stage = stage;
    billingStage.date = date;
    billingStage.details = details;
    billingStage.paid = paid;
    await patient.save();

    res.json({ success: true, billingStage });
  } catch (error) {
    handleErrors(res, 'Error updating billing stage', error);
  }
});

// Delete a specific billing stage
router.delete('/patients/:patientId/billing-stages/:stageId', async (req, res) => {
  const { patientId, stageId } = req.params;

  try {
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!patient.billing_info) {
      patient.billing_info = { billing_stages: [] };
    }

    const billingStage = patient.billing_info.billing_stages.id(stageId);
    if (!billingStage) {
      return res.status(404).json({ success: false, message: 'Billing stage not found' });
    }

    billingStage.remove();
    await patient.save();

    res.json({ success: true, message: 'Billing stage deleted successfully' });
  } catch (error) {
    handleErrors(res, 'Error deleting billing stage', error);
  }
});

module.exports = router;
