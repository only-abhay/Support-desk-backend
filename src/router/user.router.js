import express from "express";
import {
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
} from "../controller/user.controller.js";
const UserRouter = express.Router();
import Protect from "../middleware/protect.js";

UserRouter.post("/signup", SignUp);
UserRouter.post("/verify-otp", VerifyOTP);
UserRouter.post("/login", Login);
UserRouter.post("/admin-login", adminLogin);
UserRouter.get("/get/:email", getUserByEmail);
UserRouter.delete("/delete/:id", deletebyId);
UserRouter.get("/get-me", Protect, GetProfile);
UserRouter.get("/logout", Protect, Logout);
UserRouter.get("/me", Protect, GetCurrentUser);
UserRouter.get("/logout/user", Protect, userLogout);

export default UserRouter;
