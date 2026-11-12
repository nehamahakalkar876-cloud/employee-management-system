
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },

  // Forgot Password OTP fields
  resetOtpHash: {
    type: String,
    default: null
  },
  resetOtpExpires: {
    type: Date,
    default: null
  },
  resetOtpAttempts: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);
