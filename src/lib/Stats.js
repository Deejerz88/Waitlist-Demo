import { DateTime } from "luxon";
import axios from "axios";

class Stats {
  constructor(date) {
    this.date = date;
  }
  async getStats(...fields) {
    console.log("getting stats");
    const date = this.date || "8/27/2022";
    const dt = DateTime.local();
    const open = dt.weekday === 6 ? 10 : 11;
    dt.set({ hour: open });
    console.log('open',open, dt.weekday, dt.hour)
    const numHours = dt.diff(dt.set({ hour: open }), "hours").minutes / 60
    console.log("numHours", numHours);
    const production = process.env.NODE_ENV === "production" ? true : false;
    const appUrl = production
      ? "https://pm-waitlist.herokuapp.com"
      : "http://localhost:5000";
    console.log({ date });
    let res = await axios.get(`${appUrl}/waitlist/History?date=${date}`);
    res = res.data
      .filter(
        (item) =>
          item.submitted &&
          item.waiting &&
          !(item.waiting < 0) &&
          item.waiting <= 20
      )
      .filter((item) => item.submitted.indexOf(date) > -1);
    console.log({ res });
    let stats = [];
    fields.forEach((field) => {
      const result = this[field]();
      console.log(result);
      stats.push(result);
    });
  }
  avg() {
    console.log("getting avg");
  }
  numServed() {
    console.log("getting numServed");
  }
}
const stats = new Stats();
stats.getStats("avg", "numServed");
// export default Stats
