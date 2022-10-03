import express from "express";
import "dotenv/config";

import getRouter from './waitlist.js'
import updateRouter from './update.js'
import deleteRouter from "./delete.js";
import textRouter from './text.js'
import addSelfRouter from './addSelf.js';


const production = process.env.NODE_ENV === "production" ? true : false;
console.log({ production });
console.log(process.env.NODE_ENV);

//import helmet from 'helmet'

const app = express();

app.use("/waitlist", getRouter);
app.use("/update", updateRouter);
app.use("/delete", deleteRouter);
app.use("/text", textRouter);
app.use("/addSelf", addSelfRouter);

app.post("/undo", (req, res) => {
  // let socketId = req.query.socketId;
  // pusher.trigger(channel, `${db}Undo`, "undo", { socket_id: socketId });
  res.send("edit undone");
});

app.post("/redo", (req, res) => {
  // let socketId = req.query.socketId;
  // pusher.trigger(channel, `${db}Redo`, "redo", { socket_id: socketId });
  res.send("edit redone");
});

export default app;
