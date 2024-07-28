const express = require('express');
const router = express.Router();
const User = require('../model/User');
require('dotenv').config();

router.get('/doctors', async (req, res) => {
    try {
      const doctors = await User.find({ 'staffDetails.staffCategory.name': 'Doctor' });
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  module.exports = router;
  