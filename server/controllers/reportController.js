import Report from '../models/Report.js';




export const createReport = async (req, res) => {
  try {
    const { reported_user_id, reason, description, evidence_urls } = req.body;

    if (!reported_user_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'reported_user_id and reason are required',
      });
    }

    
    if (reported_user_id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    const report = await Report.create({
      reported_user_id,
      reported_by: req.user._id,
      reason,
      description: description || '',
      evidence_urls: evidence_urls || [],
      status: 'pending',
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reported_user_id', 'name email')
      .populate('reported_by', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const updateReportStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, admin_notes: admin_notes || '' },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reported_by: req.user._id })
      .populate('reported_user_id', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
