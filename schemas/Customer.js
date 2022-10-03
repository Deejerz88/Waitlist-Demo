import mongoose from "mongoose";
const { Schema } = mongoose;

const customerSchema = new Schema({
  name: String,
  description: String,
  submitted: String,
  served: String,
  unix: Number,
  location: String,
  phone: String,
  waiting: Number,
});

customerSchema.pre('save', function (next) {
  delete this.__v;
})

export default customerSchema
