import plugins from "./plugns.js";

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
  onClick: (e, elements, chart) => {
    console.log(elements);
    console.log(e);
  },
  stacked: true,
  plugins,
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

export default options