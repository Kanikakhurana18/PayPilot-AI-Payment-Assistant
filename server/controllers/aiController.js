import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";

import generateAIInsights, {
  generateAIChatResponse,
  generateAIRecoveryPlan,
} from "../services/aiService.js";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const getInvoiceTiming = (dueDate, invoiceStatus) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (due.getTime() - today.getTime()) / DAY_IN_MS
  );

  const isOverdue =
    invoiceStatus === "Overdue" || daysRemaining < 0;

  let priority = "Upcoming";

  if (isOverdue) {
    priority = "Overdue";
  } else if (daysRemaining <= 3) {
    priority = "Urgent";
  }

  return {
    daysRemaining,
    daysOverdue: isOverdue
      ? Math.max(0, Math.abs(daysRemaining))
      : 0,
    priority,
    status: isOverdue ? "Overdue" : invoiceStatus,
  };
};

const getBusinessData = async (userId) => {
  const [invoices, payments] = await Promise.all([
    Invoice.find({ user: userId }).populate("customer"),

    Payment.find({ user: userId })
      .populate("invoice")
      .populate("customer")
      .sort({ createdAt: -1 }),
  ]);

  const completedPayments = payments.filter(
    (payment) => payment.status === "Completed"
  );

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

    customerPayments[customerId].totalPaid += Number(
      payment.amount || 0
    );

    customerPayments[customerId].paymentCount += 1;
  });

  const topCustomers = Object.values(customerPayments)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5);

  const recoveryInvoices = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .map((invoice) => {
      const timing = getInvoiceTiming(
        invoice.dueDate,
        invoice.status
      );

      return {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customer?._id?.toString() || null,
        customer: invoice.customer?.name || "Unknown",
        description: invoice.description || "",
        amount: Number(invoice.amount || 0),
        dueDate: invoice.dueDate,
        daysRemaining: timing.daysRemaining,
        daysOverdue: timing.daysOverdue,
        priority: timing.priority,
        status: timing.status,
      };
    })
    .sort((a, b) => {
      const priorityOrder = {
        Overdue: 0,
        Urgent: 1,
        Upcoming: 2,
      };

      return (
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.daysRemaining - b.daysRemaining
      );
    });

  const pendingInvoices = recoveryInvoices.filter(
    (invoice) => invoice.status === "Pending"
  );

  const overdueInvoices = recoveryInvoices.filter(
    (invoice) => invoice.priority === "Overdue"
  );

  const customerOutstandingMap = {};
  recoveryInvoices.forEach((invoice) => {
    const customerId = invoice.customerId || invoice.customer;
    if (!customerOutstandingMap[customerId]) {
      customerOutstandingMap[customerId] = {
        customer: invoice.customer,
        outstandingAmount: 0,
        overdueAmount: 0,
        invoiceCount: 0,
        overdueInvoiceCount: 0,
      };
    }

    const customerData = customerOutstandingMap[customerId];
    customerData.outstandingAmount += invoice.amount;
    customerData.invoiceCount += 1;
    if (invoice.priority === "Overdue") {
      customerData.overdueAmount += invoice.amount;
      customerData.overdueInvoiceCount += 1;
    }
  });

  const customerOutstanding = Object.values(
    customerOutstandingMap
  ).sort((a, b) => b.overdueAmount - a.overdueAmount);

  const totalOutstanding = recoveryInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );

  const totalOverdue = overdueInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );

  return {
    totalInvoices: invoices.length,

    totalRevenue: completedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    ),
    successfulPayments: completedPayments.length,

    topCustomers,

    pendingInvoiceCount: pendingInvoices.length,
    overdueInvoiceCount: overdueInvoices.length,

    totalOutstanding,
    totalOverdue,

    pendingInvoices: pendingInvoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      description: invoice.description,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
    })),

    overdueInvoices: overdueInvoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      daysOverdue: invoice.daysOverdue,
    })),

    recoveryInvoices,
    customerOutstanding,

    recentPayments: payments.slice(0, 10).map((payment) => ({
      invoiceNumber: payment.invoice?.invoiceNumber || "N/A",
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
    })),
  };
};

export const getAIInsights = async (req, res) => {
  try {
    const businessData = await getBusinessData(req.user._id);

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
      message: "Could not generate AI insights.",
    });
  }
};

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

    const businessData = await getBusinessData(req.user._id);

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

export const getPaymentReminders = async (req, res) => {
  try {
    const businessData = await getBusinessData(req.user._id);

    const reminders = businessData.recoveryInvoices.map((invoice) => ({
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      daysRemaining: invoice.daysRemaining,
      daysOverdue: invoice.daysOverdue,
      priority: invoice.priority,
      status: invoice.status,
    }));

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

export const getPaymentRecoveryPlan = async (req, res) => {
  try {
    const businessData = await getBusinessData(req.user._id);

    if (businessData.recoveryInvoices.length === 0) {
      return res.status(200).json({
        success: true,
        recoveryPlan:
          "Great news! There are no unpaid invoices requiring recovery action right now.",
        summary: {
          totalOutstanding: 0,
          totalOverdue: 0,
          overdueInvoiceCount: 0,
        },
        prioritizedInvoices: [],
        customerOutstanding: [],
      });
    }

    const recoveryPlan = await generateAIRecoveryPlan(businessData);

    res.status(200).json({
      success: true,
      recoveryPlan,

      summary: {
        totalOutstanding: businessData.totalOutstanding,
        totalOverdue: businessData.totalOverdue,
        overdueInvoiceCount: businessData.overdueInvoiceCount,
        pendingInvoiceCount: businessData.pendingInvoiceCount,
      },

      prioritizedInvoices: businessData.recoveryInvoices,

      customerOutstanding: businessData.customerOutstanding,
    });
  } catch (error) {
    console.error("AI recovery plan error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not generate the payment recovery plan.",
    });
  }
};
