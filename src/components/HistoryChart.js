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
import axios from "axios";
import _ from "lodash";
// import Pusher from "pusher-js"

const production = process.env.NODE_ENV === "production" ? true : false;
const appUrl = production
  ? "https://pm-waitlist.herokuapp.com"
  : "http://localhost:5000";
const today = DateTime.local().toFormat("yyyy-MM-dd");
// const pusher = new Pusher("292d5c10fab755578a14", {
//   cluster: "us2",
// })
// const pChannel = production ? "Playmakers" : "test"
// const channel = pusher.subscribe(pChannel)
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

const plugins = {
  legend: {
    position: "top",
    labels: {
      usePointStyle: true,
    },
  },
  title: {
    display: true,
    text: "Wait Times",
    font: { size: 20 },
  },
  tooltip: {
    enabled: true,
    backgroundColor: "#f5f5f5",
    titleColor: "#333",
    bodyColor: "blue",
    position: "nearest",
    usePointStyle: true,
    callbacks: {
      title: (tooltipItem) => {
        const time = _.pickBy(tooltipItem, (value, key) => value.dataset.label !== "Customers Per Hour" && value.dataset.label !== 'Hourly Average')[0]
        if (!time) return
        return DateTime.fromMillis(time.raw.x).toLocaleString(
          DateTime.TIME_SIMPLE
        );
      },
    },
  },
  zoom: {
    pan: {
      enabled: true,
      modifierKey: "ctrl",
    },
    zoom: {
      wheel: {
        enabled: true,
        modifierKey: "ctrl",
        animation: {
          duration: 1000,
          easing: "easeOutCubic",
        },
      },
      pinch: {
        enabled: true,
      },
      drag: {
        enabled: true,
        modifierKey: "shift",
      },
      mode: "x",
    },
  },
};
const options = {
  responsive: true,
  transitions: {
    zoom: {
      animation: {
        duration: 1000,
        easing: "easeOutCubic",
      },
    },
  },
  interaction: {
    mode: "index",
    intersect: true,
  },
  stacked: false,
  plugins: plugins,
  scales: {
    y: {
      min: 0,
      position: "left",
      title: {
        display: true,
        text: "Wait Time",
        font: { size: 20, weight: "bold" },
      },
    },
    x: {
      type: "time",
      time: {
        unit: "hour",
      },
    },
    y1: {
      display: true,
      min: 0,
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: "Cutomers",
        font: {
          size: 20,
          weight: "bold",
        },
      },
    },
  },
};

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
  componentDidUpdate() {
    // setChartData(this.state.date).then((data) => {
    //   this.setState({ data })
    // })
  }
  componentDidMount() {
    this.setChartData(this.state.date);
    document.querySelector("#historyChart").style.display = "none";
    // channel.bind(`HistoryUpdated`, ({customer}) => {
    //   console.log("data", customer)
    //   let newData = {
    //     x: DateTime.fromFormat(
    //       customer.submitted,
    //       "M/d/yyyy, h:mm:ss a"
    //     ).toMillis(),
    //     y: customer.waiting,
    //   }
    //   const chart = ChartJS.getChart('chart')
    //   chart.data.datasets[0].data.push(newData)
    //   chart.update()
    // })
  }
  setChartData(date) {
    console.log({ date });

    axios.get(`${appUrl}/waitlist/History`).then((res) => {
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
      const perHourData = _.chain(res)
        .groupBy((item) => {
          return DateTime.fromFormat(
            item.submitted,
            "M/d/yyyy, h:mm:ss a"
          ).toFormat("M/d/yyyy h a");
        })
        .map((value, key) => {
          return {
            x: DateTime.fromFormat(key, "M/d/yyyy h a").toMillis(),
            y: value.length,
          };
        })
        .value();
      console.log({ perHourData });
      const waitTimes = res.map((item) => {
        return {
          x: DateTime.fromFormat(
            item.submitted,
            "M/d/yyyy, h:mm:ss a"
          ).toMillis(),
          y: item.waiting,
        };
      });
      const avg = _.meanBy(res, "waiting");
      const avgLine = res.map((item) => {
        return {
          x: DateTime.fromFormat(
            item.submitted,
            "M/d/yyyy, h:mm:ss a"
          ).toMillis(),
          y: avg,
        };
      });
      avgLine.unshift({
        x: DateTime.fromMillis(avgLine[0].x).plus({ hours: -1 }).toMillis(),
        y: avg,
      });
      const hourlyAvg = _.chain(res)
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
      console.log({ hourlyAvg });
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
            // order: 0
          },
          {
            label: "Average",
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
            label: "Customers Per Hour",
            type: "bar",
            data: perHourData,
            backgroundColor: "rgba(200, 247, 197,.5)",
            borderWidth: 1,
            borderColor: "rgba(200, 247, 197,1)",
            yAxisID: "y1",
            pointStyle: "rect",
            order: 3,
          },
          {
            label: "Hourly Average",
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
    });
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
