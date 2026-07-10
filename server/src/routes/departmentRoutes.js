import { Router } from "express";
import { createDepartment, getDepartments } from "../controllers/departmentController.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getDepartments);
router.post("/", protect, allowRoles("Admin"), createDepartment);

export default router;
