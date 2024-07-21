const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../model/User'); // Ensure this path is correct

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Endpoint to upload profile picture
router.post('/users/:userId/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.personal_info.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicture: user.personal_info.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile picture', error });
  }
});

module.exports = router;
