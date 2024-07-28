const express = require('express');
const router = express.Router();
const User = require('../model/User');
require('dotenv').config();

// Get Patient Details by Medical Record Number
router.get('/patients/:medicalRecordNumber', async (req, res) => {
  const { medicalRecordNumber } = req.params;

  try {
    // Find the user by medical record number
    const user = await User.findOne({ medicalRecordNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Construct the response object
    const patientDetails = {
      _id: user._id,
      firstName: user.personal_info.first_name,
      middleName: user.personal_info.middle_name,
      surname: user.personal_info.last_name,
      email: user.personal_info.contact.email,
      contactNumber: user.personal_info.contact.phone,
      dateOfBirth: user.personal_info.date_of_birth,
      gender: user.personal_info.gender,
      emergencyContactNumber: user.personal_info.emergencyContactNumber,
      address: {
        country: user.personal_info.address.country,
        state: user.personal_info.address.state,
        city: user.personal_info.address.city,
        street: user.personal_info.address.street,
        houseNumber: user.personal_info.address.house_number
      },
      patientDetails: user.patientDetails ? {
        admittedBy: user.patientDetails.admittedBy,
        supervisedBy: user.patientDetails.supervisedBy,
        bed: user.patientDetails.bed,
        medication: user.patientDetails.medication,
        admittedDate: user.patientDetails.admittedDate,
        age: user.patientDetails.age,
        billings: user.patientDetails.billings
      } : null
    };

    // Return the user details
    res.status(200).json({
      success: true,
      user: patientDetails
    });
  } catch (error) {
    console.error('Error fetching patient details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient details',
      error: error.message
    });
  }
});

module.exports = router;
