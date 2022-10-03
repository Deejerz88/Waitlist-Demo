import mongoose from "mongoose";
import customerSchema from "./schemas/Customer.js";
import "dotenv/config";
import _ from "lodash";
import { DateTime } from "luxon";

mongoose.connect(process.env.MONGO_URI).catch((error) => {
  console.log(error);
});

const Customer = mongoose.model("Customer", customerSchema, "History");

Customer.find({}, (err, customers) => { 
  console.log(customers.length);
  console.log(customers[0])

  mongoose.disconnect()
})