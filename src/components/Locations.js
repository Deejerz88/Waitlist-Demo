import React from "react";
import { useNavigate } from 'react-router-dom'
import { Image, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { refreshInt } from "./tables/Waitlist.js";

function Locations() {
  const navigate = useNavigate()

  const handleClick = (path) => {
    clearInterval(refreshInt);
    navigate(path);
  }

  return (
    <div id="locContainer">
      <ToggleButtonGroup
        id="locations"
        type="radio"
        name="options"
        defaultValue={"Playmakers"}
      >
        <ToggleButton
          id="tbg-radio-1"
          value={"Playmakers"}
          onClick={() => handleClick("/")}
        >
          Playmakers
        </ToggleButton>
        <ToggleButton
          id="tbg-radio-2"
          value={"InjuryClinic"}
          onClick={() => handleClick("InjuryClinic")}
        >
          Injury Clinic
        </ToggleButton>
      </ToggleButtonGroup>
      <Image id="logo" src="pmlogo.png" />
    </div>
  );
}

export default Locations;
