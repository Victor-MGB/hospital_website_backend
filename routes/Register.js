const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const { generateMedicalRecordNumber, sendEmail } = require('../utils/sendEmail');
require('dotenv').config();

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  const { first_name, middleName, last_name, date_of_birth, gender, phone, email, username, password, emergencyContactNumber, address } = req.body;

  try {
    // Check if a user with the same email or username already exists
    const existingUserByEmail = await User.findOne({ 'personal_info.contact.email': email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        user: existingUserByEmail
      });
    }

    const existingUserByUsername = await User.findOne({ 'auth.username': username });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
        user: existingUserByUsername
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const medicalRecordNumber = generateMedicalRecordNumber();

    const newUser = new User({
      personal_info: {
        first_name,
        middleName,
        last_name,
        date_of_birth,
        gender,
        contact: {
          phone,
          email
        },
        emergencyContactNumber,
        address
      },
      auth: {
        username,
        password_hash: hashedPassword
      },
      medicalRecordNumber
    });

    await newUser.save();

    // Send the medical record number to the user's email
    await sendEmail(email, 'Your Medical Record Number', `Your medical record number is ${medicalRecordNumber}. Use this to login.`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        first_name: newUser.personal_info.first_name,
        middleName: newUser.personal_info.middleName,
        last_name: newUser.personal_info.last_name,
        date_of_birth: newUser.personal_info.date_of_birth,
        gender: newUser.personal_info.gender,
        phone: newUser.personal_info.contact.phone,
        email: newUser.personal_info.contact.email,
        username: newUser.auth.username,
        medicalRecordNumber: newUser.medicalRecordNumber
      }
    });
  } catch (error) {
    console.error('Error registering user:', error.message); // Log the specific error message
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
});

module.exports = router;
