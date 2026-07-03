import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import generateToken from '../utils/generateToken.js';
import admin from '../config/firebase.js';
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    role,
    organization_name,
    phone,
    address,
    document_type,
    document_url,
    document_filename,
    additional_notes,
  } = req.body;

  try {
    // Basic validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, email, and password',
      });
    }

    // Additional validations for organizer registration
    if (role === 'organizer') {
      if (!document_url || !document_filename) {
        return res.status(400).json({
          success: false,
          message: 'Please upload your verification document.',
        });
      }
    }

    // Check if user email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }
    // Check if username already exists
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Generate nice default avatar
    const profileImage = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Create new user
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password,
      role: role || 'trekker',
      phone: phone || '',
      profileImage,
    });
    
    if (user) {
      // If role is organizer, create Organizer profile immediately
      if (role === 'organizer') {
        await Organizer.create({
          user_id: user._id,
          organization_name: organization_name || name,
          phone: phone || '',
          address: address || '',
          status: 'pending',
          documents: document_url,
          submitted_documents: [
            {
              document_type: document_type || 'Verification Proof',
              url: document_url,
              filename: document_filename,
              submitted_at: Date.now(),
            },
          ],
          submission_date: Date.now(),
          additional_notes: additional_notes || '',
        });
      }

      // Generate token and set cookie
      const token = generateToken(res, user._id, user.role);

      return res.status(201).json({
        success: true,
        token,
        data: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email 
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token and set cookie
    const token = generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};


export const getMe = async (req, res) => {
  try {
    let token;
    const activeRole = req.headers['x-active-role'] || 'trekker';

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 

    if (!token) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token, excluding the password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // If token verification fails or any other error, just return null user (200 OK) to avoid console errors on initial load
    return res.status(200).json({
      success: true,
      data: null,
    });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, bio, profileImage, username } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.phone = phone !== undefined ? phone : user.phone;
      user.bio = bio !== undefined ? bio : user.bio;
      user.profileImage = profileImage || user.profileImage;
      user.profile_image = profileImage || user.profile_image;
      
      if (username && username.toLowerCase() !== user.username) {
        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken',
          });
        }
        user.username = username.toLowerCase();
      }

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          createdAt: updatedUser.createdAt,
        },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating user profile',
      error: error.message,
    });
  }
};

//    Logout user & clear cookie
//    POST /api/auth/logout
//   Public
export const logoutUser = async (req, res) => {
  const activeRole = req.headers['x-active-role'] || 'trekker';
  try {
    res.cookie(`token_${activeRole}`, '', {
      httpOnly: true,
      expires: new Date(0), // Set expiration to past date to immediately invalidate
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error(`Logout Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'No ID token provided',
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = email.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        name: name || 'Google User',
        username,
        email,
        provider: 'google',
        profileImage: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`,
      });
    } else {
      // If user exists but used a different provider originally, update profile picture if missing
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save({ validateBeforeSave: false });
      }
    }

    // Generate token
    const token = generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`Google Auth Error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Google token',
      error: error.message,
    });
  }
};
