const express = require('express');
const multer = require('multer');
const path = require('path');
const { User, SharedImage } = require('../model/User'); // Ensure this path is correct

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

// Endpoint to upload an image and share with a user or admin
router.post('/share-image', upload.single('image'), async (req, res) => {
  const { sharedWith, sharedBy } = req.body; // sharedWith: ID of the recipient, sharedBy: ID of the sender (admin or user)

  try {
    // Check if user exists (optional)
    const user = await User.findById(sharedBy);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newSharedImage = new SharedImage({
      user_id: sharedBy,
      image_url: `/uploads/${req.file.filename}`,
      shared_with: sharedWith,
      shared_by: sharedBy
    });

    await newSharedImage.save();

    res.status(201).json({ message: 'Image shared successfully', imageUrl: newSharedImage.image_url });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing image', error });
  }
});

// Endpoint to get shared images for a user
router.get('/shared-images/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const sharedImages = await SharedImage.find({ shared_with: userId });
    res.status(200).json(sharedImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shared images', error });
  }
});

module.exports = router;
