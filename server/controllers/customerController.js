
import Customer from "../models/customer.js";
import Invoice from "../models/invoice.js";

// CREATE CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, businessName, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      businessName,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL CUSTOMERS
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, businessName, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, businessName, address },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CUSTOMER
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Prevent deletion if customer has invoices
    const existingInvoice = await Invoice.findOne({
      customer: customer._id,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message:
          "This customer has invoices and cannot be deleted. Their payment history must be preserved.",
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
