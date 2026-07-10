import Department from "../models/Department.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ department });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate("headOfficer", "name email").sort({ departmentName: 1 });
  res.json({ departments });
});
