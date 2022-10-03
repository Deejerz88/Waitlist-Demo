import Switch from "react-switch";
import React, { Component } from "react";

class HistorySwitch extends Component {
  
  constructor(props) {
    super(props);
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
    this.selector = props.selector
  }
  

  handleChange(checked) {
    this.setState({ checked });
    let element = document.querySelector(this.selector)
    const show = this.state.checked
    if (!show) {
      element.style.display = "";
      element.style.opacity = 1;
    }
    else {
      element.style.opacity = 0;
      setTimeout(() => { element.style.display = 'none' },500)
    }
  }

  render() {
    return (
          <Switch
            checked={this.state.checked}
            onChange={this.handleChange}
            onColor="#86d3ff"
            onHandleColor="#2693e6"
            handleDiameter={18}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={12}
            width={30}
            className="react-switch"
            id="material-switch"
          />
    );
  }
}

export default HistorySwitch;
