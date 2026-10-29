import AgentModel from "../models/agent.model.js";
import UserModel from "../models/user.model.js";

const getUsers = async (_req, res) => {
  try {
    const users = await UserModel.find({ role: { $ne: "admin" } })
      .select("-password -otp -otpExpire")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const convertUserToAgent = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || user.role === "admin") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let agent = await AgentModel.findById(user._id);
    if (agent && agent.email !== user.email) {
      return res.status(409).json({
        success: false,
        message: "An agent with this ID already exists",
      });
    }

    if (!agent) {
      const agentWithEmail = await AgentModel.findOne({ email: user.email });
      if (agentWithEmail) {
        return res.status(409).json({
          success: false,
          message: "An agent with this email already exists",
        });
      }

      agent = await AgentModel.create({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        status: user.status ? "active" : "inactive",
      });
    }

    await UserModel.deleteOne({ _id: user._id });

    const safeAgent = agent.toObject();
    delete safeAgent.password;

    return res.status(201).json({
      success: true,
      message: "User converted to agent successfully",
      agent: safeAgent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAgentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const agent = await AgentModel.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    agent.status = status;
    await agent.save();

    const safeAgent = agent.toObject();
    delete safeAgent.password;

    return res.status(200).json({
      success: true,
      message: "Agent status updated successfully.",
      agent: safeAgent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { convertUserToAgent, getUsers, updateAgentStatus };
