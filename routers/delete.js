import express from "express";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import { ObjectID } from "bson";
import { pusher } from "../server.js";
import customerSchema from "../schemas/Customer.js";

const production = process.env.NODE_ENV === "production" ? true : false;
const channel = production ? "Playmakers" : "test";
const app = express();

app.delete("/:db/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI).catch((error) => {
    console.log(error);
  });
  console.log("Delete Record");
  let db = req.params.db;
  const Customer = mongoose.model("Customer", customerSchema, db);
  console.log(db);
  let id = ObjectID(req.params.id);
  let query = { _id: id };
  await Customer.deleteOne(query);
  let customer = req.body;
  console.log('query', req.query)
  const {socketId} = req.query;
  console.log('socketId', socketId)
  pusher.trigger(channel, `${db}Deleted`, id, { socket_id: socketId });
  if (db === "History" || db === "InjuryClinic") {
    res.send(`${id} deleted`);
    return;
  }
  //add to history
  const History = mongoose.model("Customer", customerSchema, "History");
  const now = DateTime.now()
    .setZone("America/New_York")
    .toLocaleString(DateTime.TIME_WITH_SECONDS);
  customer.served = now;
  delete customer.__v
  console.log('customer', customer)
  await History.updateOne(query, customer, { upsert: true });
  console.log(customer.name + " added to History");
  pusher.trigger(channel, "HistoryUpdated", { customer });
  res.send(`${id} deleted`);
});

export default app;