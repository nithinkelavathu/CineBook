const User = require("../models/user");
const Otp = require("../models/Otp"); // NEW
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // NEW
const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
};

// 📧 Send OTP to Email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered!" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[TESTING] OTP for ${email} is: ${otp}`);

    // Store in DB (will auto-delete in 5 min)
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send the email
    await sendEmail({
      email,
      subject: "CineBook - Your Verification Code 🛡️",
      message: `Your One-Time Password (OTP) for CineBook registration is: ${otp}\n\nThis code will expire in 5 minutes. Do not share it with anyone.`
    });

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // 2. Password Strength Check
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password is too weak" });
    }

    // 3. Verify OTP
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    // 4. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // 5. Delete OTP after successful use
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(201).json({ message: "User registered is successfully done! You can now login now happily" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};