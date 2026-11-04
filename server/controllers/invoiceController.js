
import Invoice from "../models/invoice.js";
import Customer from "../models/customer.js";

export const createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      description,
      amount,
      dueDate,
    } = req.body;

    if (!customerId || !description || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      customer: customerId,
      description,
      amount,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
