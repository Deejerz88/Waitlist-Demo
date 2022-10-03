import axios from "axios";
import _ from "lodash";
import { DateTime } from "luxon";

let customersByHour,
  waitTimes,
  avg,
  avgLine,
  hourlyAvg,
  customersPerHour,
  numServed;

const production = process.env.NODE_ENV === "production" ? true : false;
const appUrl = production
  ? "https://pm-waitlist.herokuapp.com"
  : "http://localhost:5000";

const getStats = async (date) => {
  const dt = DateTime.local();
  date = date || dt.toLocaleString(DateTime.DATE_SHORT);
  const openHour = dt.weekday === 6 ? 10 : 11;
  const open = DateTime.local().set({ hour: openHour, minute: 0 });
  const diff = dt.diff(open, "minutes").minutes / 60;
  const numHours = diff > 1 ? diff : 1;
  //get History
  let res = await axios.get(`${appUrl}/waitlist/History?date=${date}`);
  res = res.data.filter(
    (item) =>
      item.submitted &&
      item.waiting &&
      !(item.waiting < 0) &&
      item.waiting <= 30
  );

  //numServed
  numServed = res.length;

  //customersPerHour
  customersPerHour = (numServed / numHours).toFixed(1) || 0;

  const perHourData = _.chain(res).groupBy((item) => {
    return DateTime.fromFormat(item.submitted, "M/d/yyyy, h:mm:ss a").toFormat(
      "M/d/yyyy h a"
    );
  });

  //customersByHour
  customersByHour = perHourData
    .map((value, key) => {
      return {
        x: DateTime.fromFormat(key, "M/d/yyyy h a").toMillis(),
        y: value.length,
      };
    })
    .value();

  //waitTimes
  waitTimes = res.map((item) => {
    return {
      x: DateTime.fromFormat(item.submitted, "M/d/yyyy, h:mm:ss a").toMillis(),
      y: item.waiting,
    };
  });

  //avg
  avg = _.meanBy(res, "waiting");

  //avgLine
  avgLine = res.map((item) => {
    return {
      x: DateTime.fromFormat(item.submitted, "M/d/yyyy, h:mm:ss a").toMillis(),
      y: avg,
    };
  });

  avgLine.unshift({
    x: DateTime.fromMillis(avgLine[0].x).plus({ hours: -1 }).toMillis(),
    y: avg,
  });

  //hourlyAvg
  hourlyAvg = _.chain(res)
    .groupBy((item) => {
      return DateTime.fromFormat(
        item.submitted,
        "M/d/yyyy, h:mm:ss a"
      ).toFormat("M/d/yyyy h a");
    })
    .map((value, key) => {
      return {
        x: DateTime.fromFormat(key, "M/d/yyyy h a").toMillis(),
        y: _.meanBy(value, "waiting"),
      };
    })
    .value();

  return {
    customersByHour,
    waitTimes,
    avg,
    avgLine,
    hourlyAvg,
    customersPerHour,
    numServed,
  };
};

export default getStats;
