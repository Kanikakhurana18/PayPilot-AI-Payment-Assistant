import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
