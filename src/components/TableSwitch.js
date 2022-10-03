import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import $ from "jquery";

function TableSwitch() {
  const changeHandler = (e) => {
    const val = e.target.value;
    console.log("val", val);
    if (val === "Table") {
      $(".history").show().css("opacity", 1);
      $("#historyChart").hide().css("opacity", 0);
    } else {
      $(".history").hide().css("opacity", 0);
      $("#historyChart").show().css("opacity", 1);
    }
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <div>
        <ButtonGroup
          id="tableSwitch"
          className="my-3"
          // type="radio"
          // name="options"
          defaultValue={"Table"}
          onClick={(e) => changeHandler(e)}
        >
          <Button value={"Table"}>Table</Button>
          <Button value={"Chart"}>Chart</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default TableSwitch;
