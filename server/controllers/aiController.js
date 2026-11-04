
import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";
import generateAIInsights, {
  generateAIChatResponse,
} from "../services/aiService.js";

// Shared function: fetch actual business data from MongoDB.
const getBusinessData = async () => {
  const [invoices, payments] = await Promise.all([
    Invoice.find().populate("customer"),
    Payment.find()
  .populate("invoice")
  .populate("customer")
  .sort({ createdAt: -1 }),
  ]);

  const today = new Date();

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  );

  const overdueInvoices = invoices.filter(
    (invoice) =>
      invoice.status !== "Paid" &&
      new Date(invoice.dueDate) < today
  );

  const completedPayments = payments.filter(
    (payment) => payment.status === "Completed"
  );
  // Calculate total payments made by each customer.
const customerPayments = {};

completedPayments.forEach((payment) => {
  const customerId = payment.customer?._id?.toString();

  if (!customerId) return;

  if (!customerPayments[customerId]) {
    customerPayments[customerId] = {
      customer: payment.customer.name || "Unknown",
      totalPaid: 0,
      paymentCount: 0,
    };
  }

  customerPayments[customerId].totalPaid += Number(payment.amount || 0);
  customerPayments[customerId].paymentCount += 1;
});

const topCustomers = Object.values(customerPayments)
  .sort((a, b) => b.totalPaid - a.totalPaid)
  .slice(0, 5);

  const businessData = {
    totalInvoices: invoices.length,

    totalRevenue: completedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    ),

    successfulPayments: completedPayments.length,

    topCustomers, // 👈 YAHAN ADD KARNA HAI

    pendingInvoiceCount: pendingInvoices.length,

    overdueInvoiceCount: overdueInvoices.length,

    pendingInvoices: pendingInvoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer?.name || "Unknown",
      description: invoice.description,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
    })),

    overdueInvoices: overdueInvoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer?.name || "Unknown",
      amount: invoice.amount,
      dueDate: invoice.dueDate,
    })),

    recentPayments: payments.slice(0, 10).map((payment) => ({
      invoiceNumber: payment.invoice?.invoiceNumber || "N/A",
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
    })),
  };

  return businessData;
};

// Existing dashboard insights API.
export const getAIInsights = async (req, res) => {
  try {
    const businessData = await getBusinessData();
    const insights = await generateAIInsights(businessData);

    res.status(200).json({
      success: true,
      businessData,
      insights,
    });
  } catch (error) {
    console.error("AI insights controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not generate AI insights",
    });
  }
};

// New chatbot API.
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    const businessData = await getBusinessData();

    const reply = await generateAIChatResponse(
      message.trim(),
      businessData
    );

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI chat controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not generate an AI response. Please try again.",
    });
  }
};



// Get payment reminder recommendations.
export const getPaymentReminders = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      status: { $in: ["Pending", "Overdue"] },
    }).populate("customer");

    const today = new Date();

    const reminders = invoices.map((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysRemaining = Math.ceil(
        (dueDate - today) / (1000 * 60 * 60 * 24)
      );

      let priority = "Upcoming";

      if (daysRemaining < 0) {
        priority = "Overdue";
      } else if (daysRemaining <= 3) {
        priority = "Urgent";
      }

      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name || "Unknown",
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        daysRemaining,
        priority,
        status: invoice.status,
      };
    });

    reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error("Payment reminders error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch payment reminders.",
    });
  }
};
