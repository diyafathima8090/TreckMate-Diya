import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';




export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false,
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, reference_id, reference_type } = req.body;

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: type || 'system',
      reference_id: reference_id || '',
      reference_type: reference_type || '',
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !message || !target) {
      return res.status(400).json({ success: false, message: 'Please provide title, message, and target' });
    }

    
    let userQuery = {};
    if (target === 'organizers') {
      userQuery.role = 'organizer';
    } else if (target === 'trekkers') {
      userQuery.role = 'trekker';
    }
    

    const users = await User.find(userQuery).select('_id');

    
    const announcement = await Announcement.create({
      title,
      message,
      target,
      sentBy: req.user.name,
      admin_id: req.user._id,
    });

    
    const notifications = users.map(user => ({
      user_id: user._id,
      title,
      message,
      type: 'system',
      reference_type: '',
      reference_id: '',
    }));

    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getSentAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const pushNotification = async ({ user_id, title, message, type, reference_id, reference_type }) => {
  try {
    await Notification.create({
      user_id,
      title,
      message,
      type: type || 'system',
      reference_id: reference_id || '',
      reference_type: reference_type || '',
    });
  } catch (err) {
    console.error('Failed to push notification:', err.message);
  }
};
