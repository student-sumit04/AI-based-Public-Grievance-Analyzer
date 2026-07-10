import { Router } from "express";
import { classify, similarity, summarize } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.post("/classify", classify);
router.post("/summarize", summarize);
router.post("/similarity", similarity);

export default router;
