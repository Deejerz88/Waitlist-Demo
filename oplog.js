import mongoose from "mongoose";
import customerSchema from "./schemas/Customer.js";
import "dotenv/config";
import _ from "lodash";
import { DateTime } from "luxon";

mongoose
  .connect(
    "mongodb+srv://DJMcMillan:Georgiatech1208@waitlistcluster.9slly.mongodb.net/local?retryWrites=true&w=majority"
  )
  .catch((error) => {
    console.log(error);
  });

// const Customer = mongoose.model("Customer", customerSchema, "oplog.rs");
// Customer.find({ ns: "Waitlist.History", op: "d" }).limit(100).exec((err, history) => {
//   console.log(history[history.length - 1]);
//   console.log(history.length);
//   mongoose.connection.close()
// })

mongoose.connection.once("open", async () => {
  mongoose.connection.db
    .collection("oplog.rs")
    .find({ ns: "Waitlist.History", op: "i" })
    .toArray(async (err, history) => {
      console.log(history[history.length - 1]);
      console.log(history.length);
      history = history.filter(
        (item) =>
          (item.o.name || item.o.description) &&
          item.o.name.indexOf("test") === -1 &&
          item.o.submitted &&
          item.o.waiting < 30
      );
      console.log("filtered", history.length);
      history = _.uniqBy(history, (value) => value.o._id.toHexString());
      console.log("unique", history.length);
      history = history.map((item) => {
        // console.log(item.o.submitted);
        const unix = DateTime.fromFormat(
          item.o.submitted,
          "M/d/yyyy, h:mm:ss a"
        ).toMillis();
        item.o.unix = unix;
        return item.o
      });
      await mongoose.disconnect();
      mongoose.connect(process.env.MONGO_URI);
      const Customer = mongoose.model("Customer", customerSchema, "History");
      //     // const customer = new Customer( history[history.length - 1].o);
      //     // await customer.save();+
      console.log("filtered", history.length, history[0]);
      history.forEach((doc) => {
        // const Customer = mongoose.model(
        //   "Customer",
        //   customerSchema,
        //   "History"
        // );

        new Customer(doc).save();
      });
    });
});
