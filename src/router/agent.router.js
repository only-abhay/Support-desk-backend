import express from "express";
import {
  convertUserToAgent,
  getUsers,
  updateAgentStatus,
} from "../controller/agent.controller.js";
import Protect, { Authorized } from "../middleware/protect.js";

const router = express.Router();

router.get("/users", Protect, Authorized("admin"), getUsers);
router.post("/:id/convert", Protect, Authorized("admin"), convertUserToAgent);
router.patch("/:id/status", Protect, Authorized("admin"), updateAgentStatus);

export default router;
