import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { getStats } from "../lib/index.js";
import Pusher from "pusher-js";
// import Stats from "../lib/Stats.js";

class StatsBar extends React.Component {
  constructor() {
    super();
    this.state = {
      perHourData: [],
      waitTimes: [],
      avg: 0,
      avgLine: [],
      hourlyAvg: [],
      numServed: 0,
      history: [],
    };
  }
  componentDidMount() {
    this.setStats();
    const production = process.env.NODE_ENV === "production" ? true : false;
    const pusher = new Pusher("292d5c10fab755578a14", {
      cluster: "us2",
    });
    const pChannel = production ? "Playmakers" : "test";
    const channel = pusher.subscribe(pChannel);
    channel.bind("HistoryUpdated", (data) => {
      console.log("stats updating");
      this.setStats();
    });
  }
  async setStats() {
    console.log("setting stats");
    const stats1 = await getStats();
    console.log("stats", stats1);
    if (!stats1) return;
    this.setState({
      avg: stats1.avg,
      customersPerHour: Number(stats1.customersPerHour),
      numServed: stats1.numServed,
    });
    console.log(this.state);
  }
  render() {
    return (
      <Container
        id="stats-container"
        fluid
        className="d-flex justify-content-center"
      >
        <Card id="total">
          <Card.Body>
            <Row>
              <Col>
                <Card.Title className="">
                  Total <br /> Served
                </Card.Title>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                <Card.Text>{this.state.numServed.toFixed(0)}</Card.Text>
              </Col>
            </Row>
            <Row>
              <Card.Footer>Customers</Card.Footer>
            </Row>
          </Card.Body>
        </Card>
        <Card id="average">
          <Card.Body>
            <Row>
              <Col>
                <Card.Title>
                  Avg <br /> Wait
                </Card.Title>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                <Card.Text>{this.state.avg.toFixed(2)}</Card.Text>
              </Col>
            </Row>
            <Row>
              <Card.Footer>Minutes</Card.Footer>
            </Row>
          </Card.Body>
        </Card>
        <Card id="per-hour">
          <Card.Body>
            <Row>
              <Col>
                <Card.Title>
                  Per <br /> Hour
                </Card.Title>
              </Col>
              <Col className="d-flex flex-column justify-content-center">
                <Card.Text>
                  {this.state.customersPerHour || (0.0).toFixed(1)}
                </Card.Text>
              </Col>
            </Row>
            <Row>
              <Card.Footer>Customers</Card.Footer>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default StatsBar;
