
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}
const router = express.Router();
// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  console.log("FORGOT PASSWORD API CALLED");
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    // Generic response for security
    if (!user) {
      return res.json({
        message: "If your account exists, an OTP will be sent."
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOtpHash = otpHash;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpAttempts = 0;

    await user.save();

   await createTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Employee Management System - Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`
    });

    res.json({
      message: "If your account exists, an OTP will be sent."
    });

  } catch (error) {
    console.error("OTP Email Error:", error.message);

    res.status(500).json({
      message: "Unable to send OTP. Please try again later."
    });
  }
});
// Reset Password - Verify OTP and Update Password
router.post("/reset-password", async (req, res) => {
  console.log("FORGOT PASSWORD API CALLED");
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP."
      });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please request a new OTP."
      });
    }

    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (enteredOtpHash !== user.resetOtpHash) {
      user.resetOtpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;

    await user.save();

    res.json({
      message: "Password reset successful. Please login."
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      userId: newUser._id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.toLowerCase()
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

export default router;
