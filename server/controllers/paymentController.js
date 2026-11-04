
import axios from "axios";
import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";
import getPayPalAccessToken from "../services/paypalService.js";

export const createPayPalOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate("customer");

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
          return_url: "http://localhost:5173/payment/success",
          cancel_url: "http://localhost:5173/payment/cancel",
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

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "COMPLETED") {
      const payment = await Payment.findOneAndUpdate(
        { paypalOrderId: orderId },
        { status: "Completed" },
        { new: true }
      );

      if (payment) {
        await Invoice.findByIdAndUpdate(payment.invoice, {
          status: "Paid",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
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
    const payments = await Payment.find()
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
