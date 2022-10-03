import express from "express";
import mongoose from "mongoose";
import customerSchema from "../schemas/Customer.js";
import { DateTime } from "luxon";

const app = express();

app.get("/:db", (req, res) => {
  // console.log(req,'received from', req.method);
  // console.log(process.env.MONGO_URI);
  // const date = req.query.date || DateTime.local().toFormat('')
  mongoose
    .connect(process.env.MONGO_URI)
    .then("connected")
    .catch((error) => {
      console.log(error);
    });
  let query = {};
  const db = req.params.db;
  console.log(db);
  const Customer = mongoose.model("Customer", customerSchema, db);
  if (db === "History") {
    const date = req.query.date || DateTime.local().toFormat("M/d/yyyy");
    query = { submitted: { $regex: date } };
  }
  console.log(query);
  Customer.find(query, (err, result) => {
    res.json(result);
  });
});

export default app;
