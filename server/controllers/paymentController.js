import Payment from '../models/Payment.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';


export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user._id })
      .populate('trip_id', 'title location image')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user_id', 'name email')
      .populate('trip_id', 'title location')
      .sort({ createdAt: -1 })
      .lean();

    const formattedPayments = payments.map((p) => ({
      _id: p._id,
      user_name: (p.user_id && p.user_id.name) || 'Unknown User',
      trip_name: (p.trip_id && p.trip_id.title) || 'Unknown Trip',
      amount: p.amount || 0,
      payment_method: p.payment_method || 'other',
      transaction_id: p.transaction_id || '',
      payment_status: p.payment_status || 'success',
      createdAt: p.createdAt
    }));

    res.json({ success: true, count: formattedPayments.length, data: formattedPayments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createPayment = async (req, res) => {
  try {
    const { trip_id, amount, payment_method, transaction_id } = req.body;
    const payment = await Payment.create({
      user_id: req.user._id,
      trip_id,
      amount,
      payment_method: payment_method || 'other',
      transaction_id: transaction_id || '',
      payment_status: 'success',
    });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
