export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return the secure URL from cloudinary
    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};
