import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import Locations from "./components/Locations.js";
import Table from "./react-routes/Table.js";
import TableSwitch from "./components/TableSwitch.js";
import History from "./react-routes/History.js";
import { HistoryChart } from "./components/chart/HistoryChart.js";
import HistorySwitch from "./components/HistorySwitch.js";
import StatsBar from "./components/StatsBar.js";
import { Container } from "react-bootstrap";
import * as serviceWorker from "./serviceWorkerRegistration.js";

serviceWorker.register();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Container fluid>
    <Router>
      <Locations />
      <Table />
      <StatsBar />

      <Container fluid className="d-flex justify-content-center">
        <h1>
          History <HistorySwitch selector="#historyContainer" />
        </h1>
      </Container>
      <Container fluid id="historyContainer">
        <TableSwitch />
        <History />
        <HistoryChart />
      </Container>
    </Router>
  </Container>
);
