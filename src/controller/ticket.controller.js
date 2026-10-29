import Ticket from "../models/ticket.model.js";
import Agent from "../models/agent.model.js";

// ===============================
// CREATE TICKET
// ===============================

export const createTicket = async (req, res) => {
  try {
    const { subject, category, issue, priority } = req.body;

    const ticket = await Ticket.create({
      userId: req.user._id,
      subject,
      category,
      issue,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Ticket Created Successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL TICKETS
// ===============================

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select("-password").sort({ name: 1 });

    res.status(200).json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      userId: req.user._id,
    })
      .populate("userId", "name email")
    .populate("assignedTo", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAssignedTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Open",
      "In Progress",
      "Waiting For Customer",
      "Resolved",
      "Closed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Assigned ticket not found",
      });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE TICKET
// ===============================

export const getSingleTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .populate("messages.sender", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicketMessages = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).select(
      "userId assignedTo messages",
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isAssignedAgent =
      req.user.role === "agent" &&
      ticket.assignedTo?.toString() === req.user._id.toString();
    const isTicketCustomer =
      req.user.role === "customer" &&
      ticket.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAssignedAgent && !isTicketCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this ticket conversation",
      });
    }

    res.status(200).json({
      success: true,
      messages: ticket.messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE TICKET
// Admin update status/category/priority
// ===============================

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,

      {
        status: req.body.status,
        priority: req.body.priority,
        assignedTo: req.body.assignedTo,
      },

      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Ticket Updated",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ADD MESSAGE
// Customer + Agent Reply

export const addTicketMessage = async (req, res) => {
  try {
    const message = req.body.message?.trim();

    if (!message || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 1 and 5000 characters",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isAssignedAgent =
      req.user.role === "agent" &&
      ticket.assignedTo?.toString() === req.user._id.toString();
    const isTicketCustomer =
      req.user.role === "customer" &&
      ticket.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAssignedAgent && !isTicketCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot reply to this ticket",
      });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
    });

    await ticket.save();

    const chatMessage = ticket.messages[ticket.messages.length - 1];

    res.status(200).json({
      success: true,
      message: "Reply Added",
      ticket,
      chatMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE TICKET
// ===============================

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AssignTicket = async (req, res) => {
  try {
    const { ticketId, agentId } = req.body;

    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }
    // Find the agent by ID
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }
    if (agent.status !== "active") {
      return res.status(409).json({
        success: false,
        message: "Tickets can only be assigned to active agents.",
      });
    }
 
    // Assign the ticket to the agent
    ticket.assignedTo = agent._id;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket assigned to agent successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
