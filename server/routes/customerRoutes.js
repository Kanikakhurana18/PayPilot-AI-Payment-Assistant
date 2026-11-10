import express from "express";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/", createCustomer);
router.get("/", getCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
