import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    // Customer who raised ticket
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    // Ticket Subject
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // Ticket Category
    category: {
      type: String,
      enum: [
        "Billing",
        "Shipping",
        "Account",
        "Technical",
        "Order",
        "Refund",
        "Payment",
        "Other",
      ],
      required: true,
    },

    // Customer Issue Description
    issue: {
      type: String,
      required: true,
      trim: true,
    },

    // Ticket Priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    // Ticket Status
    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Waiting For Customer",
        "Resolved",
        "Closed",
      ],
      default: "Open",
    },

    // Customer conversation
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        senderName: {
          type: String,
        },

        senderRole: {
          type: String,
          enum: ["customer", "agent", "admin"],
        },

        message: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // File/Image attachment
    attachments: [
      {
        url: String,
        type: String,
      },
    ],

    // Ticket closed time
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
