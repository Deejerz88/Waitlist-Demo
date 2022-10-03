import _ from "lodash";
import { DateTime } from "luxon";

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
        const time = _.pickBy(
          tooltipItem,
          (value, key) =>
            value.dataset.label !== "Customers Per Hour" &&
            value.dataset.label !== "Hourly Average"
        )[0];
        if (!time) return;
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

export default plugins