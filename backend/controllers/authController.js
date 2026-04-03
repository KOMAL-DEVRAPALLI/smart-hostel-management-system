import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
// ================= LOGIN =================

export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;


    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }


    // check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }


    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }


    // create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    res.status(200).json({
      token,
      role: user.role,
    });

  } catch (error) {
  console.error("LOGIN ERROR:", error);
  res.status(500).json({ message: error.message });

  }
};