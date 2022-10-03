import express from "express";
import mongoose from "mongoose";
import { ObjectID } from "bson";
import { DateTime } from "luxon";
import { pusher } from "../server.js";
import customerSchema from "../schemas/Customer.js";

const app = express();
const production = process.env.NODE_ENV === "production" ? true : false;
const channel = production ? "Playmakers" : "test";

app.post("/", async (req, res) => {
  // console.log(req, res);
  mongoose.connect(process.env.MONGO_URI).catch((error) => {
    console.log(error);
  });
  console.log(req.body);
  const { name, description, phone, location } = req.body;
  const id = ObjectID();
  const waitlist = channel;
  const Customer = mongoose.model("Customer", customerSchema, waitlist);
  let dt = DateTime.now();
  const submitted = dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
  const customer = {
    _id: id,
    submitted,
    name,
    description,
    location,
    phone,
  };
  pusher.trigger(channel, `${waitlist}Updated`, { customer });
  res.send("added to waitlist");
  let query = { _id: id };
  let newValues = {
    $set: {
      submitted,
      name,
      description,
      location,
      phone,
    },
  };
  // customer;
  await Customer.updateOne(query, newValues, { upsert: true });
  console.log(customer.name + " added from text");
});

export default app;
