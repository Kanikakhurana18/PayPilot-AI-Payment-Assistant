import axios from "axios";
import mongoose from "mongoose";
import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";
import getPayPalAccessToken from "../services/paypalService.js";

export const createPayPalOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user._id,
    }).populate("customer");
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already paid",
      });
    }

    const accessToken = await getPayPalAccessToken();
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const response = await axios.post(
      `${process.env.PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: invoice._id.toString(),
            description: invoice.description,
            amount: {
              currency_code: "USD",
              value: Number(invoice.amount).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${frontendUrl}/payment/success`,
          cancel_url: `${frontendUrl}/payment/cancel`,
          user_action: "PAY_NOW",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const order = response.data;

    await Payment.create({
      user: req.user._id,
      invoice: invoice._id,
      customer: invoice.customer._id,
      paypalOrderId: order.id,
      amount: invoice.amount,
      currency: "USD",
      status: "Created",
    });

    const approvalUrl = order.links.find(
      (link) => link.rel === "approve"
    )?.href;
    res.status(201).json({
      success: true,
      message: "PayPal order created",
      orderId: order.id,
      approvalUrl,
    });
  } catch (error) {
    console.error(
      "PayPal order error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Could not create PayPal order",
    });
  }
};

export const capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required",
      });
    }

    const paymentRecord = await Payment.findOne({
      paypalOrderId: orderId,
      user: req.user._id,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (paymentRecord.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed",
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const capture = response.data.purchase_units?.[0]?.payments?.captures?.[0];

    const isValidCapture =
      response.data.id === orderId &&
      capture?.status === "COMPLETED" &&
      capture?.amount?.currency_code === paymentRecord.currency &&
      Number(capture?.amount?.value).toFixed(2) ===
      Number(paymentRecord.amount).toFixed(2);

    if (!isValidCapture) {
      return res.status(400).json({
        success: false,
        message: "PayPal payment verification failed",
      });
    }

    await Payment.findOneAndUpdate(
      {
        _id: paymentRecord._id,
        user: req.user._id,
      },
      {
        status: "Completed",
      },
      { new: true }
    );

    await Invoice.findOneAndUpdate(
      {
        _id: paymentRecord.invoice,
        user: req.user._id,
      },
      {
        status: "Paid",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment captured and verified successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Payment capture error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Payment capture failed",
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    })
      .populate("invoice")
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};