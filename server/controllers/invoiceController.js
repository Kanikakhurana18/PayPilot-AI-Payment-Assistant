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

    const customer = await Customer.findOne({
      _id: customerId,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber: `INV-${Date.now()}`,
      customer: customer._id,
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
    console.error("Create invoice error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.user._id,
    })
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
};
