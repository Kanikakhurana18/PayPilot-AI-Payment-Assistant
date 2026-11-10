import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { name, businessName, email, password } = req.body;
    if (!name || !businessName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      businessName: businessName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        businessName: user.businessName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }
    return res.status(500).json({
      message: "Something went wrong during signup.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email. Please sign up first to create your PayPilot account.",
        code: "USER_NOT_FOUND",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect password. Please try again.",
        code: "INCORRECT_PASSWORD",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        businessName: user.businessName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong during login.",
    });
  }
};