import UserModel from "../models/user.model.js";
import AgentModel from "../models/agent.model.js";
import jwt from "jsonwebtoken";

const Protect = async (req, res, next) => {
  try {
    let token = null;

    // Cookie Token

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // Header Token

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const decoded = jwt.verify(token, process.env.CRYPTR_SECRET);

    let user;

    if (decoded.role === "agent") {
      const agent = await AgentModel.findById(decoded.id).select("-password");
      if (agent) {
        user = { ...agent.toObject(), role: "agent" };
      }
    }

    if (!user) {
      user = await UserModel.findById(decoded.id).select(
        "-password -otp -otpExpire",
      );
    }

    if (!user) {
      const agent = await AgentModel.findById(decoded.id).select("-password");
      if (agent) {
        user = { ...agent.toObject(), role: "agent" };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,

        message: "Account not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error);

    return res.status(401).json({
      success: false,

      message: "Invalid Token",
    });
  }
};

export default Protect;

const Authorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        messege: "forbidden",
        success: false,
      });
    }
    next();
  };
};

export { Protect, Authorized };
