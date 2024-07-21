const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Ensure this path is correct
const sendEmail = require('../utils/sendEmail'); // Ensure this path is correct

const router = express.Router();

// Helper function to generate a medical record number
const generateMedicalRecordNumber = () => {
  return 'MRN' + Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
router.post('/auth/register', async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, phone, email, username, password, profilePicture } = req.body;

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
        last_name,
        date_of_birth,
        gender,
        contact: {
          phone,
          email
        },
        profilePicture
      },
      auth: {
        username,
        password_hash: hashedPassword
      },
      medicalRecordNumber
    });

    await newUser.save();

    // Send the medical record number to the user's email
    sendEmail(email, 'Your Medical Record Number', `Your medical record number is ${medicalRecordNumber}. Use this to login.`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering user', error });
  }
});


// Log in a user
router.post('/auth/login', async (req, res) => {
  const { medicalRecordNumber, password } = req.body;

  try {
    // Find the user by medical record number
    const user = await User.findOne({ medicalRecordNumber });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid medical record number or password' });
    }

    // Check if the provided password matches the hashed password
    const isMatch = await bcrypt.compare(password, user.auth.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid medical record number or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success and user details
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        first_name: user.personal_info.first_name,
        last_name: user.personal_info.last_name,
        date_of_birth: user.personal_info.date_of_birth,
        gender: user.personal_info.gender,
        contact: user.personal_info.contact,
        profilePicture: user.personal_info.profilePicture,
        medicalRecordNumber: user.medicalRecordNumber,
        medical_info: user.medical_info,
        insurance_info: user.insurance_info,
        appointments: user.appointments,
        emergency_contact: user.emergency_contact,
        billing_info: user.billing_info,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error });
  }
});


// Log out a user
router.post('/auth/logout', (req, res) => {
  // Invalidate the token on the client side
  res.json({ message: 'User logged out successfully' });
});

// Refresh authentication tokens
router.post('/auth/refresh', (req, res) => {
  // Implement token refresh logic
  res.json({ message: 'Token refreshed successfully' });
});

// Forgot password
// Forgot password
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ 'personal_info.contact.email': email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a reset link
    const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`;

    // Send the reset link to the user's email
    await sendEmail(email, 'Reset Your Password', `Click the following link to reset your password: ${resetLink}`);

    res.json({ success: true, message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
  }
});

// Reset password
router.post('/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.auth.password_hash = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Check if users exist
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    // Return the list of users
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});


// Delete user
router.delete('/auth/delete-user', async (req, res) => {
  const { medicalRecordNumber } = req.body;

  try {
    const user = await User.findOneAndDelete({ medicalRecordNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});


module.exports = router;
