import express from "express";
import {
  createInvoice,
  getInvoices,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/", createInvoice);
router.get("/", getInvoices);

export default router;
