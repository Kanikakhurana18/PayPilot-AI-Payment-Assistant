import express from "express";
import {
  getAIInsights,
  chatWithAI,
  getPaymentReminders,
  getPaymentRecoveryPlan,
} from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/insights", getAIInsights);
router.post("/chat", chatWithAI);
router.get("/reminders", getPaymentReminders);
router.get("/recovery", getPaymentRecoveryPlan);

export default router;
