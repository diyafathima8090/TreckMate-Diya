import Organizer from '../models/Organizer.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const uploadDir = 'uploads/verification_docs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'), false);
  }
};

export const documentUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter
});

export const getMyOrganizerProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ user_id: req.user._id }).populate(
      'user_id',
      'name email phone profile_image'
    );

    if (!organizer) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: organizer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrganizerProfile = async (req, res) => {
  try {
    const existing = await Organizer.findOne({ user_id: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Organizer profile already exists',
      });
    }

    const { organization_name, license_number, experience, documents, phone, description } =
      req.body;

    const organizer = await Organizer.create({
      user_id: req.user._id,
      organization_name,
      license_number: license_number || '',
      experience: experience || 0,
      documents: documents || '',
      phone: phone || '',
      description: description || '',
      status: 'pending',
    });

    
    await User.findByIdAndUpdate(req.user._id, { role: 'organizer' });

    res.status(201).json({ success: true, data: organizer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrganizerProfile = async (req, res) => {
  try {
    const { organization_name, license_number, experience, documents, phone, description } =
      req.body;

    const organizer = await Organizer.findOneAndUpdate(
      { user_id: req.user._id },
      { organization_name, license_number, experience, documents, phone, description },
      { new: true, runValidators: true }
    );

    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer profile not found' });
    }

    res.json({ success: true, data: organizer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrganizers = async (req, res) => {
  try {
    const users = await User.find({ role: 'organizer' }).lean();
    const profiles = await Organizer.find().lean();
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));

    const formattedOrganizers = users.map((user) => {
      const profile = profileMap.get(user._id.toString()) || {};
      
      return {
        _id: profile._id || user._id, 
        user_id: user._id,
        organization_name: profile.organization_name || user.name,
        license_number: profile.license_number || 'Not submitted',
        experience: profile.experience || 0,
        documents: profile.documents || '',
        phone: profile.phone || user.phone,
        status: profile.status || 'pending',
        rating: profile.rating || 0,
        total_treks: profile.total_treks || 0,
        earnings: profile.earnings || 0,
        createdAt: profile.createdAt || user.createdAt,
        updatedAt: profile.updatedAt || user.updatedAt,
        user_id_populated: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profileImage || user.profile_image
        }
      };
    });

    res.json({ success: true, count: formattedOrganizers.length, data: formattedOrganizers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateOrganizerStatus = async (req, res) => {
  try {
    const { status, admin_notes, rejection_reason } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = {
      status,
      admin_review_date: Date.now(),
    };

    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason;

    let organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    
    if (!organizer) {
      organizer = await Organizer.findOneAndUpdate(
        { user_id: req.params.id },
        updateData,
        { new: true }
      );
    }

    
    if (!organizer) {
      const user = await User.findById(req.params.id);
      if (user && user.role === 'organizer') {
        organizer = await Organizer.create({
          user_id: user._id,
          organization_name: user.name,
          phone: user.phone || '',
          status: status,
          admin_notes: admin_notes || '',
          rejection_reason: rejection_reason || '',
          admin_review_date: Date.now(),
        });
      } else {
        return res.status(404).json({ success: false, message: 'Organizer profile could not be updated' });
      }
    }

    res.json({ success: true, data: organizer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const uploadVerificationDoc = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({
      success: true,
      filename: req.file.filename,
      url: `/api/organizer/documents/${req.file.filename}`,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

export const serveSecureDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    
    if (req.user.role === 'admin') {
      const filePath = path.resolve('uploads/verification_docs', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      return res.sendFile(filePath);
    }

    
    if (req.user.role === 'organizer') {
      const organizer = await Organizer.findOne({ user_id: req.user._id });
      if (!organizer) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      
      const ownsDoc =
        organizer.submitted_documents.some((doc) => doc.filename === filename) ||
        organizer.documents.includes(filename);

      if (!ownsDoc) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this document' });
      }

      const filePath = path.resolve('uploads/verification_docs', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      return res.sendFile(filePath);
    }

    return res.status(403).json({ success: false, message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resubmitOrganizerDocuments = async (req, res) => {
  try {
    const {
      document_type,
      document_url,
      document_filename,
      additional_notes,
      organization_name,
      phone,
      address,
    } = req.body;

    if (!document_type || !document_url || !document_filename) {
      return res.status(400).json({ success: false, message: 'Please provide all document details' });
    }

    const organizer = await Organizer.findOne({ user_id: req.user._id });
    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer profile not found' });
    }

    
    organizer.status = 'pending';
    organizer.submission_date = Date.now();
    organizer.rejection_reason = '';
    organizer.admin_notes = '';

    
    if (organization_name) organizer.organization_name = organization_name;
    if (phone) organizer.phone = phone;
    if (address) organizer.address = address;
    if (additional_notes) organizer.additional_notes = additional_notes;

    
    organizer.documents = document_url;

    
    organizer.submitted_documents.push({
      document_type,
      url: document_url,
      filename: document_filename,
      submitted_at: Date.now(),
    });
    await organizer.save();
    
    if (phone) {
      await User.findByIdAndUpdate(req.user._id, { phone });
    }

    res.json({
      success: true,
      message: 'Verification documents resubmitted successfully',
      data: organizer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};