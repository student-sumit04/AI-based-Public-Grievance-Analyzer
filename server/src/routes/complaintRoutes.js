import { Router } from "express";
import { createComplaint, getComplaint, getComplaints, updateStatus } from "../controllers/complaintController.js";
import { allowRoles, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(protect);
router.post("/", allowRoles("Citizen", "Admin"), upload.array("attachments", 4), createComplaint);
router.get("/", getComplaints);
router.get("/:id", getComplaint);
router.put("/:id/status", allowRoles("Officer", "Admin"), updateStatus);

export default router;
