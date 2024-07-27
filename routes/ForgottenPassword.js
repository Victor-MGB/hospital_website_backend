const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Adjust the path as necessary
const { sendEmail } = require('../utils/sendEmail'); // Ensure this path is correct
require('dotenv').config();

const router = express.Router();

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token and expiration in the database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetLink = `https://${req.headers.host}/reset-password/${token}`;
    const emailText = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
    ${resetLink}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`;
    await sendEmail(user.email, 'Password Reset', emailText);

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
  }
});

module.exports = router;
