const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Bed = require('../model/BedSchema');
const mongoose = require('mongoose'); // Add this line
require('dotenv').config();

// Bed Management Endpoints
router.get('/beds', async (req, res) => {
  try {
    const beds = await Bed.find();
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

router.get('/beds/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const beds = await Bed.find({ status });
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/beds/:bedNo/status', async (req, res) => {
  try {
    const bed = await Bed.findOne({ bedNo: req.params.bedNo });
    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    bed.status = req.body.status;
    await bed.save();
    res.status(200).json(bed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/patients/:medicalRecordNumber/assign-bed', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    patient.patientDetails.bed = req.body.bedId;
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Checkup Management Endpoints
router.post('/patients/:medicalRecordNumber/checkups', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const checkup = req.body;

    // Check if the billingId is a valid ObjectId
    if (checkup.payment && checkup.payment.billingId && mongoose.Types.ObjectId.isValid(checkup.payment.billingId)) {
      checkup.payment.billingId = new mongoose.Types.ObjectId(checkup.payment.billingId); // Use new keyword
    } else {
      // Handle the case where billingId is not valid
      checkup.payment.billingId = new mongoose.Types.ObjectId(); // Generate a new ObjectId
    }

    patient.patientDetails.checkupDetails.push(checkup);
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.get('/patients/:medicalRecordNumber/checkups', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber }).select('patientDetails.checkupDetails');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient.patientDetails.checkupDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Treatment Management Endpoints
router.post('/patients/:medicalRecordNumber/treatments', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    patient.patientDetails.treatments.push(req.body);
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/patients/:medicalRecordNumber/treatments', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber }).select('patientDetails.treatments');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient.patientDetails.treatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/patients/:medicalRecordNumber/treatments', async (req, res) => {
  try {
    const patient = await User.findOne({ medicalRecordNumber: req.params.medicalRecordNumber });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Apply updates to all treatments
    patient.patientDetails.treatments.forEach(treatment => {
      treatment.approved = true;
    });

    await patient.save();
    res.status(200).json(patient.patientDetails.treatments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Middleware to validate billing info
const validateBillingInfo = (req, res, next) => {
  const { billing_stages } = req.body;

  if (!billing_stages || !Array.isArray(billing_stages)) {
      return res.status(400).json({ message: 'Billing stages are required and must be an array' });
  }

  for (const stage of billing_stages) {
      if (!stage.stage || !stage.dueDate) {
          return res.status(400).json({ message: 'Each billing stage must have a stage and a dueDate' });
      }
  }

  next();
};

router.post('/patients/:medicalRecordNumber/billing', validateBillingInfo, async (req, res) => {
  try {
      const { medicalRecordNumber } = req.params;
      const patient = await User.findOne({ medicalRecordNumber });

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      if (!patient.patientDetails) {
          patient.patientDetails = {};
      }

      patient.patientDetails.billingInfo = req.body;
      await patient.save();

      res.status(201).json(patient.patientDetails.billingInfo);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

router.get('/patients/:medicalRecordNumber/billing', async (req, res) => {
  try {
    const { medicalRecordNumber } = req.params;
    console.log(`Searching for patient with medicalRecordNumber: ${medicalRecordNumber}`);
    
    // Fetch the patient details including billingInfo
    const patient = await User.findOne({ medicalRecordNumber }).select('patientDetails');
    
    if (!patient) {
      console.log('Patient not found');
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    console.log('Patient found:', JSON.stringify(patient, null, 2));
    
    const { patientDetails } = patient;

    // Ensure patientDetails and billingInfo exists before accessing billingInfo
    if (!patientDetails || !patientDetails.billingInfo) {
      console.log('No billing info found for patient:', patientDetails);
      return res.status(404).json({ message: 'No billing info found for patient' });
    }
    
    const billingInfo = patientDetails.billingInfo;
    console.log('Billing info found:', JSON.stringify(billingInfo, null, 2));
    res.status(200).json(billingInfo);
  } catch (error) {
    console.error('Error retrieving billing information:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/patients/:medicalRecordNumber/billing', async (req, res) => {
  try {
      const { medicalRecordNumber } = req.params;
      console.log(`Received medicalRecordNumber: ${medicalRecordNumber}`); // Debugging line
      console.log(`Request body: ${JSON.stringify(req.body)}`); // Debugging line

      const patient = await User.findOne({ medicalRecordNumber: medicalRecordNumber });
      if (!patient) {
          console.log('Patient not found'); // Debugging line
          return res.status(404).json({ message: 'Patient not found' });
      }

      if (!patient.patientDetails) {
          patient.patientDetails = {};
      }

      if (req.body.hasOwnProperty('adminApproval')) {
          patient.patientDetails.adminApproval = req.body.adminApproval;
      }

      await patient.save();

      console.log('Patient updated:', patient); // Debugging line

      res.status(200).json({ message: 'Payment approval status updated', adminApproval: patient.patientDetails.adminApproval });
  } catch (error) {
      console.error('Error updating patient:', error); // Debugging line
      res.status(400).json({ message: error.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
