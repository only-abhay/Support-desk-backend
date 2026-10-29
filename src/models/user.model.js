import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ek email se sirf ek hi account ban sakta hai
      lowercase: true, // email hamesha chhote letters mein save ho
    },
    password: {
      type: String,
      required: true, // ye hamesha HASHED save hoga, plain text nahi
    },
    role: {
      type: String,
      enum: ["admin", "agent", "customer"], // sirf ye 3 values allowed hain
      default: "customer",
    },
    otpExpire: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },

    otp: {
      type: String,
    },
  },
  {
    timestamps: true, // automatically createdAt aur updatedAt add ho jayega
  },
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
