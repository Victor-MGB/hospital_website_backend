const express = require('express');
const User = require('../model/User');
require('dotenv').config();

const router = express.Router();

// Admin approves payment and updates user status
router.patch('/approve-payment/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, { status: 'approved' }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved and user status updated',
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

module.exports = router;
