import express from "express";
import api from "./routers/api.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Pusher from "pusher";

const port = process.env.PORT || 5000;
const app = express();

const pusher = new Pusher({
  appId: "1404063",
  key: "292d5c10fab755578a14",
  secret: "7c4e86a59a2f69b6e154",
  cluster: "us2",
  useTLS: true,
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(cors());
//app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", api);
app.use("/InjuryClinic", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./build", "index.html"));
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, "./build")));
// Step 2:
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./build", "index.html"));
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

export { pusher };
