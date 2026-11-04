import express from "express";
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayments
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createPayPalOrder);
router.post("/capture-order", capturePayPalOrder);
router.get("/", getPayments);

export default router;