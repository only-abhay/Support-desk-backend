import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    availability: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },

    maxTickets: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true },
);

const AgentModel = mongoose.model("Agent", agentSchema);

export default AgentModel;
