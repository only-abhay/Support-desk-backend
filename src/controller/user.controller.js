import UserModel from "../models/user.model.js";
import AgentModel from "../models/agent.model.js";
import Cryptr from "cryptr";
import { SendOtpMail } from "../utils/nodemailer.js";

import {
  AlreadyExist,
  BadRequest,
  Created,
  InternalServerError,
  Unauthorized,
} from "../utils/response.js";
import { generateToken } from "../utils/helper.js";

const SignUp = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return BadRequest(res, "All fields are required");
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      return AlreadyExist(res, "Email already exists");
    }

    const encryptedPass = cryptr.encrypt(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpire = Date.now() + 3 * 60 * 1000;

    const normalizedEmail = email;
    const mailSent = await SendOtpMail(normalizedEmail, otp);

    if (!mailSent) {
      return InternalServerError(res, "OTP mail not sent");
    }

    await UserModel.create({
      name,
      email,
      password: encryptedPass,
      otp,
      otpExpire,
    });

    return Created(res, "Registration successful. Please verify OTP.");
  } catch (error) {
    console.log(error);

    return InternalServerError(res, "Internal Server Error", error);
  }
};
//verify otp
const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return BadRequest(res, "Email and OTP are required");
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NotFound(res, "User not found");
    }

    if (user.otp !== otp) {
      return BadRequest(res, "Invalid OTP");
    }

    if (user.otpExpire < Date.now()) {
      return BadRequest(res, "OTP expired");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    return Created(res, "OTP verified successfully");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

//login
const Login = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

    const { email, password } = req.body;

    if (!email || !password) {
      return BadRequest(res, "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    let account = await UserModel.findOne({
      email: normalizedEmail,
    });

    let accountRole;
    let isAgentModelAccount = false;

    // First, check the UserModel
    if (account) {
      accountRole = account.role;
    } else {
      // If not found, check the AgentModel
      account = await AgentModel.findOne({
        email: normalizedEmail,
      });

      if (account) {
        accountRole = "agent";
        isAgentModelAccount = true;
      }
    }

    // Account not found
    if (!account) {
      return Unauthorized(res, "Invalid email or password");
    }

    // Check agent status
    if (isAgentModelAccount && account.status !== "active") {
      return Unauthorized(res, "This agent account is not active");
    }

    // Check email verification for UserModel accounts
    if (!isAgentModelAccount && !account.isVerified) {
      return Unauthorized(res, "Please verify your email first");
    }

    // Verify password
    const decryptPass = cryptr.decrypt(account.password);

    if (decryptPass !== password) {
      return Unauthorized(res, "Invalid email or password");
    }

    // Generate token using the database role
    const token = generateToken(account, accountRole);

    res.cookie("jwt", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return Created(res, "Login successful", {
      id: account._id,
      name: account.name,
      email: account.email,
      role: accountRole,
    });
  } catch (error) {
    console.log(error);
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.log("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

    const { email, password } = req.body;
  

    if (!email || !password) {
      return BadRequest(res, "Email and password are required");
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NotFound(res, "User not found");
    }

    // Admin check
    if (user.role !== "admin") {
      return Unauthorized(res, "Only Admin can login");
    }

    const decryptPass = cryptr.decrypt(user.password);

    if (decryptPass !== password) {
      return Unauthorized(res, "Invalid email or password");
    }

    const token = generateToken(user);

    res.cookie("jwt", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return Created(res, "Admin Login successful");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const deletebyId = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return NotFound(res, "User not found");
    }

    await UserModel.findByIdAndDelete(id);

    return Created(res, "User deleted successfully");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const GetProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
        user: null,
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Access Denied",
        success: false,
        user: null,
      });
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const Logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const GetCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const safeUser = user.toObject ? user.toObject() : user;
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpire;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  SignUp,
  VerifyOTP,
  Login,
  adminLogin,
  Logout,
  GetProfile,
  deletebyId,
  getUserByEmail,
  GetCurrentUser,
  userLogout,
};
