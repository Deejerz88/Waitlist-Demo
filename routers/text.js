import express from 'express';
import twilio from "twilio";

const app = express();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);


app.post("/:db/:number", (req, res) => {
  const customer = req.body;
  console.log({ customer });
  const number = req.params.number;
  const physician = customer.physician
    ? `Your Physician, ${customer.physician},`
    : "Your Physician";
  let message =
    req.params.db === "Playmakers" || req.params.db === "test"
      ? `${customer.name}, we appreciate your patience. We have a staff member ready to assist you. Please meet us at the Greeter Stand (front of the store). Thank you for shopping at Playmakers!`
      : `${customer.name}, thank you for patience. ${physician} is ready for you. Please return to the check-in desk to be seen.`;
  client.messages
    .create({
      body: message,
      from: "+15172003280",
      to: number,
    })
    .then((message) => console.log(message.sid));
});

export default app