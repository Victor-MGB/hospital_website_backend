const express = require('express');
const router = express.Router();
const User = require('../model/User');
require('dotenv').config();

// Update Patient Details by Medical Record Number
router.put('/patients/:medicalRecordNumber', async (req, res) => {
  const { medicalRecordNumber } = req.params;
  const updateData = req.body;

  try {
    // Find the user by medical record number
    const user = await User.findOne({ medicalRecordNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update the user details
    if (updateData.firstName) user.personal_info.first_name = updateData.firstName;
    if (updateData.middleName) user.personal_info.middle_name = updateData.middleName;
    if (updateData.surname) user.personal_info.last_name = updateData.surname;
    if (updateData.email) user.personal_info.contact.email = updateData.email;
    if (updateData.contactNumber) user.personal_info.contact.phone = updateData.contactNumber;
    if (updateData.dateOfBirth) user.personal_info.date_of_birth = updateData.dateOfBirth;
    if (updateData.gender) user.personal_info.gender = updateData.gender;
    if (updateData.emergencyContactNumber) user.personal_info.emergencyContactNumber = updateData.emergencyContactNumber;
    
    if (updateData.address) {
      if (updateData.address.country) user.personal_info.address.country = updateData.address.country;
      if (updateData.address.state) user.personal_info.address.state = updateData.address.state;
      if (updateData.address.city) user.personal_info.address.city = updateData.address.city;
      if (updateData.address.street) user.personal_info.address.street = updateData.address.street;
      if (updateData.address.house_number) user.personal_info.address.house_number = updateData.address.house_number;
    }

    if (updateData.patientDetails) {
      if (!user.patientDetails) user.patientDetails = {}; // Ensure patientDetails exists

      if (updateData.patientDetails.admittedBy) user.patientDetails.admittedBy = updateData.patientDetails.admittedBy;
      if (updateData.patientDetails.supervisedBy) user.patientDetails.supervisedBy = updateData.patientDetails.supervisedBy;
      if (updateData.patientDetails.bed) user.patientDetails.bed = updateData.patientDetails.bed;
      if (updateData.patientDetails.medication) user.patientDetails.medication = updateData.patientDetails.medication;
      if (updateData.patientDetails.admittedDate) user.patientDetails.admittedDate = updateData.patientDetails.admittedDate;
      if (updateData.patientDetails.age) user.patientDetails.age = updateData.patientDetails.age;
      if (updateData.patientDetails.billings) user.patientDetails.billings = updateData.patientDetails.billings;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Patient details updated successfully.'
    });
  } catch (error) {
    console.error('Error updating patient details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating patient details',
      error: error.message
    });
  }
});

module.exports = router;
