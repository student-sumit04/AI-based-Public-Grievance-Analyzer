import { z } from "zod";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/tokens.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Citizen", "Officer", "Admin"]).default("Citizen"),
  department: z.string().optional()
});

export const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: payload.email });

  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create(payload);
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
