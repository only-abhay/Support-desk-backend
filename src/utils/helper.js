import jwt from "jsonwebtoken";

export const generateToken = (user, role = user.role) => {
  return jwt.sign(
    {
      id: user._id,
      role,
    },
    process.env.CRYPTR_SECRET,
    {
      expiresIn: "30d",
    },
  );
};
