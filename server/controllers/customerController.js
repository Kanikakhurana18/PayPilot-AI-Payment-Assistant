import Customer from "../models/customer.js";
import Invoice from "../models/invoice.js";

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
      user: req.user._id,
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
    console.error("Create customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, businessName, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
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
    console.error("Update customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const existingInvoice = await Invoice.findOne({
      customer: customer._id,
      user: req.user._id,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message:
          "This customer has invoices and cannot be deleted. Their payment history must be preserved.",
      });
    }

    await Customer.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};
