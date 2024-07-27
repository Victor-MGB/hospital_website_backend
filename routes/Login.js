const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
require('dotenv').config();

const router = express.Router();

// Price for pending users
const PENDING_PRICE = 50; // Example price in dollars

// Login endpoint
router.post('/login', async (req, res) => {
  const { medicalRecordNumber, password } = req.body;

  try {
    // Find the user by medical record number
    const user = await User.findOne({ medicalRecordNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.auth.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Handle different user statuses
    if (user.status === 'pending') {
      return res.status(200).json({
        success: true,
        message: 'Account pending',
        price: PENDING_PRICE, // Return price information
        status: 'pending'
      });
    }

    if (user.status === 'approved') {
      // Create a JWT token
      const token = jwt.sign(
        { id: user._id, medicalRecordNumber: user.medicalRecordNumber },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Return the token and user details
      res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          firstName: user.personal_info.first_name,
          middleName: user.personal_info.middle_name,
          surname: user.personal_info.last_name,
          email: user.personal_info.contact.email,
          contactNumber: user.personal_info.contact.phone,
          dateOfBirth: user.personal_info.date_of_birth,
          gender: user.personal_info.gender,
          emergencyContactNumber: user.personal_info.emergencyContactNumber,
          address: user.personal_info.address
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

module.exports = router;
