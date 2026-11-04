import express from "express";
import {
  getAIInsights,
  chatWithAI,
  getPaymentReminders,
} from "../controllers/aiController.js";

const router = express.Router();

router.get("/insights", getAIInsights);
router.post("/chat", chatWithAI);
router.get("/reminders", getPaymentReminders);

export default router;