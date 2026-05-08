const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Upload shop logo
router.post('/shop-logo', protect, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return the Cloudinary secure URL for the uploaded file
    const fileUrl = req.file.path;
    res.json({ success: true, data: { url: fileUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum 5MB allowed.' });
  }
  if (err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
