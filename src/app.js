import dotenv from "dotenv";
dotenv.config();

import ConnectDb from "./config/categoryDB.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import UserRouter from "./router/user.router.js";
import TicketRouter from "./router/ticket.router.js";
import AgentRouter from "./router/agent.router.js";
import {createServer} from "http"
import {Server} from "socket.io"
import ArticleRouter from "./router/article.router.js";


const app = express();
const HttpServer = createServer(app)
const allowedOrigins = [process.env.ORIGIN, "http://localhost:3000"]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ""));

app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/auth", UserRouter);
app.use("/query", TicketRouter);
app.use("/agent", AgentRouter);
app.use("/article",ArticleRouter)
const io = new Server(HttpServer,{
  cors:{
    origin: allowedOrigins, 
    credentials: true 
  }
})

io.on("connection", (socket) => {
  console.log("connection established");

  socket.on("joinTicket", (ticketId) => {
    if (!ticketId) return;
    socket.join(ticketId);
  });

  socket.on("leaveTicket", (ticketId) => {
    if (!ticketId) return;
    socket.leave(ticketId);
  });

  socket.on("sendMessage", ({ ticketId, message }) => {
    if (!ticketId || !message) return;
    socket.to(ticketId).emit("newMessage", { ticketId, message });
  });
});
// Listen
HttpServer.listen(process.env.PORT, () => {
  ConnectDb();
  console.log(`Server is listening ${process.env.PORT}`);
});
