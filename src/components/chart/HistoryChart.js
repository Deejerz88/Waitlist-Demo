import { DateTime } from "luxon";
import { Line } from "react-chartjs-2";
import {
  BarController,
  BarElement,
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  Legend,
} from "chart.js";
import "chartjs-adapter-luxon";
import zoomPlugin from "chartjs-plugin-zoom";
import React from "react";
// import axios from "axios"
import { InputGroup, Form } from "react-bootstrap";
// import setChartData from "../utils/setChartData.js"
// import axios from "axios";
import Pusher from "pusher-js";
import options from "./options.js";
import { getStats } from "../../lib/index.js";

const production = process.env.NODE_ENV === "production" ? true : false;
// const appUrl = production
//   ? "https://pm-waitlist.herokuapp.com"
//   : "http://localhost:5000";
const today = DateTime.local().toFormat("yyyy-MM-dd");
const pusher = new Pusher("292d5c10fab755578a14", {
  cluster: "us2",
});
const pChannel = production ? "Playmakers" : "test";
const channel = pusher.subscribe(pChannel);
ChartJS.register(
  BarController,
  Legend,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  zoomPlugin
);

export class HistoryChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        datasets: [],
      },
      date: DateTime.fromObject(props.date).toLocaleString(DateTime.DATE_SHORT),
    };
    console.log("chart state data", this.state);
  }
  componentDidUpdate() {}
  async componentDidMount() {
    console.log("mounted");
    await this.setChartData(this.state.date);
    console.log("chart data set");
    document.querySelector("#historyChart").style.display = "none";
    channel.bind(`HistoryUpdated`, ({ customer }) => {
      this.setChartData(this.state.date);
    });
  }
  async setChartData(date) {
    console.log({ date });
    const { customersByHour, waitTimes, avgLine, hourlyAvg } = await getStats(
      date
    );
    console.log("stats retrieved");
    const data = {
      datasets: [
        {
          label: "Waited",
          data: waitTimes,
          borderColor: "lightblue",
          backgroundColor: "blue",
          borderJoinStyle: "bevel",
          tension: 0.1,
          yAxisID: "y",
          pointStyle: "circle",
          pointRadius: 4,
          order: 0,
        },
        {
          label: "Day Average",
          data: avgLine,
          pointRadius: 0,
          borderDash: [5, 5],
          borderColor: "pink",
          backgroundColor: "red",
          borderJoinStyle: "bevel",
          pointStyle: "line",
          // order:0
        },
        {
          label: "Customers This Hour",
          type: "bar",
          data: customersByHour,
          backgroundColor: "rgba(200, 247, 197,.5)",
          borderWidth: 1,
          borderColor: "rgba(200, 247, 197,1)",
          yAxisID: "y1",
          pointStyle: "rect",
          order: 3,
          poitRadius: 0,
        },
        {
          label: "Hour Average",
          type: "line",
          data: hourlyAvg,
          borderColor: "orange",
          backgroundColor: "rgba(255, 165, 0,.5)",
          pointStyle: "triangle",
          pointRadius: 6,
          tension: 0.1,
        },
      ],
    };
    this.setState({ data });
  }
  render() {
    return (
      <div className={"d-flex flex-column align-items-center w-100"}>
        <div id="historyChart">
          <InputGroup className="m-3 w-25 date">
            <InputGroup.Text className="bg-primary text-white fw-bold">
              Date
            </InputGroup.Text>
            <Form.Control
              defaultValue={today}
              type="date"
              onChange={(e) => {
                this.setChartData(
                  DateTime.fromFormat(
                    e.target.value,
                    "yyyy-MM-dd"
                  ).toLocaleString(DateTime.DATE_SHORT)
                );
              }}
              aria-label="date"
            />
          </InputGroup>
          <div id={"chartContainer"}>
            <Line id="chart" options={options} data={this.state.data} />
          </div>
        </div>
      </div>
    );
  }
}
