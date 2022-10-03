import express from "express";
import mongoose from "mongoose";
// import { ObjectID } from "bson";
import { pusher } from "../server.js";
import customerSchema from "../schemas/Customer.js";

const production = process.env.NODE_ENV === "production" ? true : false;

const channel = production ? "Playmakers" : "test";

const app = express();

app.post("/:db/:id", (req, res) => {
  // console.log("updating customer");
  mongoose.connect(process.env.MONGO_URI).catch((error) => {
    console.log(error);
  });
  const update = req.body;
  delete update.__v
  console.log('update', update)
  const {db, id} = req.params;
  const socketId = req.query.socketId;
  const filter = { _id: id };
  console.log("id", id, 'db', db, 'update', update);
  const Customer = mongoose.model("Customer", customerSchema, db);
  Customer.updateOne(
    filter,
    update,
    {
      upsert: true,
      // lean: true,
    },
    (err, result) => {
      if (err) throw err;
      res.json(result);
      console.log("updated customer", result);
      pusher.trigger(channel, `${db}Updated`, update, { socketId }).then(() => {
        console.log(`update pushed to ${channel} channel for ${db} db.`);
      });
    }
  );
});

export default app;
