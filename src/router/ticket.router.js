import express from "express";
const TicketRouter = express.Router();
import Protect, { Authorized } from "../middleware/protect.js";
import {
  createTicket,
  getAllTickets,
  getAllAgents,
  getSingleTicket,
  getTicketMessages,
  updateTicket,
  addTicketMessage,
  deleteTicket,
  getMyTickets,
  AssignTicket,
  getAssignedTickets,
  updateAssignedTicketStatus,
} from "../controller/ticket.controller.js";
// Customer create ticket

TicketRouter.post("/create", Protect, createTicket);

// Admin get all tickets

TicketRouter.get("/all", Protect, getAllTickets);
TicketRouter.get("/agents", Protect, getAllAgents);

// Single ticket

TicketRouter.get("/single/:id", Protect, getSingleTicket);

// Update ticket

TicketRouter.put("/update/:id", Protect, updateTicket);

// Chat reply

TicketRouter.get("/message/:id", Protect, getTicketMessages);
TicketRouter.post("/message/:id", Protect, addTicketMessage);

// Delete

TicketRouter.delete("/delete/:id", Protect, deleteTicket);
TicketRouter.get("/my", Protect, getMyTickets);
TicketRouter.get("/assigned", Protect, Authorized("agent"), getAssignedTickets);
TicketRouter.patch(
  "/assigned/:id/status",
  Protect,
  Authorized("agent"),
  updateAssignedTicketStatus,
);

// assign to agent
TicketRouter.patch("/assign",Protect,AssignTicket)

export default TicketRouter;
