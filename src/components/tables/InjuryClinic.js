import React, { Component } from "react";
import hotkeys from "hotkeys-js";
import { TabulatorFull as Tabulator } from "tabulator-tables"; //import Tabulator library
import "tabulator-tables/dist/css/tabulator_modern.min.css";
import Pusher from "pusher-js";
import ObjectID from "bson-objectid";
import "../../index.css";
import { DateTime } from "luxon";

const production = process.env.NODE_ENV === "production" ? true : false;
console.log({ production });
const pusher = new Pusher("292d5c10fab755578a14", {
  cluster: "us2",
});

// const pChannel = production ? "Playmakers" : "test";
const channel = pusher.subscribe("Playmakers");
let socketId = null;
pusher.connection.bind("connected", () => {
  socketId = pusher.connection.socket_id;
  console.log('IC', socketId);
});
const db = "InjuryClinic";
console.log({ db });

class InjuryClinic extends Component {
  componentDidMount() {
    const check = function (cell, formatterParams, onRendered) {
      return '<button id="check" !disabled class="button-29" type="button" style="width:45px;height:35px">&#10003;</button>';
    };
    var phoneContextMenu = [
      {
        label: "Send Text",
        action: function (e, cell) {
          const number = cell.getValue();
          const customer = cell.getData()
          console.log(customer)
          console.log({ number });
          fetch(`${appUrl}/text/${db}/${number}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer),
          });
        },
      },
    ];

    hotkeys("shift+Enter", function (event, handlers) {
      addNewRow();
    });

    const appUrl = production
      ? "https://pm-waitlist.herokuapp.com"
      : "http://localhost:5000";
    console.log('injury clinic', appUrl)
    let injuryClinic = new Tabulator(this.tabulator, {
      ajaxURL: `${appUrl}/waitlist/${db}`,
      layout: "fitColumns", //fit columns to width of table
      resizableColumnFit: true,
      responsiveLayout: "hide",
      history: true, //allow undo and redo actions on the table
      height: "100%",
      movableRows: true,
      tabEndNewRow: true,
      autoResize: true,
      addRowPos: "bottom",
      index: "_id",
      placeholder: [
        "You Did It!",
        "Yay!",
        "Killin' it!",
        "How DO you do it?!",
        "Take a breather, you're doin' great.",
        "You sure you didn't miss one?",
      ][Math.floor(Math.random() * 6)],

      columns: [
        {
          title: "Name",
          field: "name",
          editor: "input",
          minWidth: 100,
          // widthGrow: 2,
          // responsive: 0,
          variableHeight: true,
          headerSort: false,
        },
        {
          title: "Description",
          field: "description",
          editor: "input",
          minWidth: 100,
          // widthGrow: 2,
          // responsive: 0,
          variableHeight: true,
          headerSort: false,
        },
        {
          title: "Waiting",
          field: "waiting",
          headerHozAlign: "center",
          headerSort: true,
          minWidth: 50,
          width: 100,
          // widthShrink: 1,
          // responsive: 0,
          hozAlign: "center",
          formatter: (cell, formatterParams, onRendered) => {
            let value = cell.getValue();
            let row = cell.getRow().getData();
            if (!row.submitted) return;
            let progress = (value % 1) * 100;
            if (isNaN(value) || !value) {
              let start = DateTime.fromFormat(row.submitted, "F");
              // console.log(start);
              let diff = DateTime.now().diff(start, "minutes");
              let waiting = diff.minutes;
              progress = (waiting % 1) * 100;
                return Math.floor(waiting) + `<hr style="width:${progress}%">`;
            }
              return Math.floor(value) + `<hr style="width:${progress}%"></hr>`;
          },
        },
        {
          title: "Physician",
          field: "physician",
          minWidth: 50,
          width: 150,
          // widthShrink: 1,
          // responsive: 1,
          hozAlign: "center",
          headerSort: false,
          headerHozAlign: "center",
          editor: "list",
          editorParams: {
            values: [
              "Joe",
              "Craig",
              "Brooke",
              "MSU Sports Med",
              "Nate",
              "Michael",
              "Kovan",
            ],
            autocomplete: true,
            listOnEmpty: true,
            freetext: true,
            verticalNavigation: "editor",
            clearable: true,
          },
        },
        {
          title: "Phone",
          visible: true,
          field: "phone",
          editor: "input",
          contextMenu: phoneContextMenu,
          hozAlign: "center",
          headerHozAlign: "center",
          // width: 150,
          // widthShrink: 1,
          // minWidth: 50,
          // maxWidth: 200,
          responsive: 2,
          maxWidth: 150,
          headerSort: false,
          editorParams: { mask: "999-999-9999", maskAutoFill: true },
          formatter: function (cell, formatterParams) {
            return cell.getValue() !== undefined &&
              cell.getValue() !== "" &&
              cell.getValue() !== null
              ? cell.getValue() + " &#128241;"
              : cell.getValue();
          },
        },
        {
          formatter: check,
          visible: true,
          field: "check",
          width: 75,
          // responsive: 0,
          hozAlign: "center",
          headerSort: false,
          cellClick: function (e, cell) {
            injuryClinic.deleteRow(cell.getRow());
          },
        },
        { title: "id", field: "_id", visible: false },
        { title: "Submitted", field: "submitted", visible: false },
      ],
      initialSort: [{ column: "waiting", dir: "desc" }],
    });

    function replaceData() {
      // console.log("replacing Data");
      // if (editing === false) {
      injuryClinic.replaceData(`${appUrl}/waitlist/${db}`);
      // }
    }

    injuryClinic.on("rowDeleted", async function (row) {
      var rowData = row.getData();
      console.log(socketId);
      var url = `${appUrl}/delete/${db}/${rowData._id}/?socketId=${socketId}`;
      // console.log(url);
      fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });
    });

    injuryClinic.on("cellEdited", function (cell) {
      // editing = false

      let rowData = cell.getRow().getData();
      const id = rowData._id;
      // console.log({ rowData });
      // eslint-disable-next-line
      if (
        (rowData.name === "" || !rowData.name === undefined) &&
        rowData.description === undefined &&
        rowData.location === undefined &&
        rowData.phone === undefined
      )
        return;
      if (rowData.submitted === undefined || rowData.submitted === "") {
        // console.log("updating time");
        let dt = DateTime.now();
        const time = dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        cell.getRow().update({ waiting: 0, submitted: time });
        rowData = cell.getData();
      }

      let url = `${appUrl}/update/${db}/${id}?socketId=${socketId}`;
      if (cell.getColumn().getField() === "waiting") return;
      try {
        // console.log(`sending request to ${url}`);
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rowData),
        });
      } catch (err) {
        console.log(err);
      }
    });

    // injuryClinic.on("cellEditing", () => {
    //   // editing = true
    //   // injuryClinic.blockRedraw();
    // });
    // injuryClinic.on("cellEditCancelled", () => {
    //   // injuryClinic.restoreRedraw();
    // });
    // injuryClinic.on("historyUndo", (action, component, data) => {
    //   if (action !== "rowDelete") {
    //   }
    // });
    injuryClinic.on("tableBuilt", function () {
      document.getElementById("undo").addEventListener("click", function () {
        injuryClinic.undo();
      });
      document.getElementById("redo").addEventListener("click", function () {
        injuryClinic.redo();
      });
      document.getElementById("add-row").addEventListener("click", function () {
        addNewRow();
      });
      document.getElementById("refresh").addEventListener("click", function () {
        replaceData();
      });
      document.getElementById("bug-report").addEventListener("click", () => {
        // showBugReport()
        let form = document.getElementById("bug-form");

        // form.src=form.src

        // form.style.display = display === "none" ? "block" : "none";
        if (form.style.height !== "0px") {
          form.style.height = 0;
          form.style.width = 0;
          // eslint-disable-next-line
          form.src = form.src;
        } else {
          form.style.width = "650px";
          form.style.height = "240px";
        }
      });

      channel.bind(`${db}Updated`, (data) => {
        let customer = data.customer;
        // console.log(customer);
        injuryClinic.updateOrAddData([customer]);
      });
      channel.bind(`${db}Deleted`, (id) => {
        // console.log(id);
        let row = injuryClinic.getRow(id);
        // console.log(row);
        if (!row) return;
        try {
          injuryClinic.deleteRow(id);
        } catch (err) {}
      });
      channel.bind(`${db}Undo`, () => {
        injuryClinic.undo();
      });
      channel.bind(`${db}Redo`, () => {
        injuryClinic.redo();
      });

      // const sendUpdate = () => {

      // }

      const setWaiting = () => {
        let tableData = injuryClinic.getData().filter((row) => !!row.submitted);
        // console.log(tableData);
        tableData.forEach((row) => {
          const id = row._id;
          const waiting = injuryClinic.getRow(id).getCell("waiting");
          let start = DateTime.fromFormat(row.submitted, "F");
          let diff = DateTime.now().diff(start, "minutes");
          waiting.setValue(diff.minutes);
        });
      };
      setInterval(setWaiting, 1000);
    });

    function addNewRow() {
      const ObjectId = ObjectID().toHexString();
      injuryClinic.addRow({ _id: ObjectId }).then((row) => {
        row.getCell("name").edit();
      });
    }
  }

  render() {
    return (
      <div>
        <div id="row-container">
          <span id="left-container">
            <button id="undo" className="button-29 buttons">
              &#9100; Undo
            </button>
            <button id="redo" className="button-29 buttons">
              &#8620; Redo
            </button>
          </span>
          <span id="right-container">
            <button id="refresh" className="button-29 buttons">
              &#x27F3; Refresh Table
            </button>
          </span>
        </div>
        <div
          id="injuryClinic"
          className="striped compact myTable"
          ref={(tabulator) => (this.tabulator = tabulator)}
        />{" "}
        <div id="row-container">
          <button id="add-row" className="button-29 buttons">
            &#43; Add Customer
          </button>
          <span id="right-container">
            <button id="bug-report" className="button-29 buttons row">
              🐛 Bug Report
            </button>
            <iframe
              src="https://www.cognitoforms.com/f/h0jNjQTY80ujat2gxeBBFg/152"
              // height="555"
              id="bug-form"
              className="row"
              title="bug-report-form"
              style={{ height: "0px", width: "0px" }}
            ></iframe>
            <script src="https://www.cognitoforms.com/f/iframe.js"></script>
          </span>
        </div>
      </div>
    );
  }
}

export default InjuryClinic;
