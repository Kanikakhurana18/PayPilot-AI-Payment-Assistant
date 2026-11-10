import express from "express";
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayments
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createPayPalOrder);
router.post("/capture-order", authMiddleware, capturePayPalOrder);
router.get("/", authMiddleware, getPayments);

export default router;
