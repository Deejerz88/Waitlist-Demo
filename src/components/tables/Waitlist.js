import React, { Component } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_modern.min.css";
import hotkeys from "hotkeys-js";
import Pusher from "pusher-js";
import ObjectID from "bson-objectid";
import "../../index.css";
import { DateTime } from "luxon";
// import { Howl } from "howler";
import $ from "jquery";
import { applyUpdates, storeUpdate, refreshData } from "../../lib/index.js";
// import {
//   alert as alertAudio,
//   served as servedAudio,
// } from "../../assets/sounds/sounds.js";

const production = process.env.NODE_ENV === "production" ? true : false;
console.log("waitlist", { production });
const pusher = new Pusher("292d5c10fab755578a14", {
  cluster: "us2",
});

const pChannel = production ? "Playmakers" : "test";
const channel = pusher.subscribe(pChannel);

const db = pChannel;
console.log("waitlist", db);
let refreshInt;
const windowDate = DateTime.local().day;

class Waitlist extends Component {
  componentDidMount() {
    // const alert = new Howl({
    //   src: alertAudio,
    // });
    // const served = new Howl({
    //   src: servedAudio,
    // });
    // const playSound = () => {
    //   console.log("playing sound");
    //   console.log(alert, served);
    //   alert.play();
    //   served.play()
    // };
    const tableDate = DateTime.local().day;
    console.log("windowDate", windowDate, "tableDate", tableDate);
    if (windowDate !== tableDate) window.location.replace("/");
    const check = function (cell, formatterParams, onRendered) {
      return '<button id="check" !disabled class="button-29" type="button" style="width:45px;height:35px">&#10003;</button>';
    };

    let editing = false;
    const phoneContextMenu = [
      {
        label: "Send Text",
        action: function (e, cell) {
          const number = cell.getValue();
          fetch(`${appUrl}/text/${db}/${number}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cell.getData()),
          });
        },
      },
    ];

    let socketId = null;
    pusher.connection.bind("connected", () => {
      socketId = pusher.connection.socket_id;
      console.log("table", socketId);
    });
    hotkeys("shift+Enter", function (event, handlers) {
      addNewRow();
    });

    const appUrl = production
      ? "https://pm-waitlist.herokuapp.com"
      : "http://localhost:5000";
    let table = new Tabulator(this.tabulator, {
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
          rowHandle: true,
          formatter: "handle",
          headerSort: false,
          frozen: true,
          width: 40,
          minWidth: 40,
        },
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
          // formatter: (cell, formatterParams, onRendered) => {
          //   const value = cell.getValue();
          //   if (!value) return;
          //   let newVal = value.replace(/\//g, "\n - ");
          //   console.log(newVal)
          //   newVal = '- ' + newVal
          //   return newVal
          // },
        },
        {
          title: "Waiting",
          field: "waiting",
          headerHozAlign: "center",
          headerSort: false,
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
              if (waiting >= 5)
                return `<div style="color:red">${Math.floor(
                  waiting
                )}<hr style="width:${progress}%"></div>`;
              else
                return Math.floor(waiting) + `<hr style="width:${progress}%">`;
            }
            if (value >= 5)
              return `<div style="color:red">${Math.floor(
                value
              )}<hr style="width:${progress}%"></div>`;
            else
              return Math.floor(value) + `<hr style="width:${progress}%"></hr>`;
          },
          sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
            let aData = aRow.getData();
            let bData = bRow.getData();
            if (!bData.submitted || !aData.submitted) return 0;
            console.log("bData", bData);
            let aStart = DateTime.fromFormat(aData.submitted, "F");
            console.log(aStart.minute);
            let bStart = DateTime.fromFormat(bData.submitted, "F");
            let aDiff = DateTime.now().diff(aStart, "minutes");
            let bDiff = DateTime.now().diff(bStart, "minutes");
            let aWaiting = aDiff.minutes;
            let bWaiting = bDiff.minutes;
            return aWaiting - bWaiting;
          },
        },
        {
          title: "Location",
          field: "location",
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
              "M Run",
              "W Run",
              "Kids",
              "W Outdoor",
              "W Casual",
              "Birks",
              "Insoles",
              "Man Cave",
              "Boutique",
              "W Sale",
              "Coach's",
              "Check-in",
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
          maxWidth: 75,
          headerSort: false,
          editorParams: { mask: "999-999-9999", maskAutoFill: true },
          formatter: function (cell, formatterParams) {
            if (!cell.getValue()) return;
            return "&#128241;";
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
            e.stopPropagation();
            console.log("table delete", socketId);
            var rowData = cell.getRow().getData();
            table.deleteRow(rowData._id);
            var url = `${appUrl}/delete/${db}/${rowData._id}?socketId=${socketId}`;
            console.log(url);
            fetch(url, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(rowData),
            });
          },
        },
        { title: "id", field: "_id", visible: false },
        { title: "Submitted", field: "submitted", visible: false },
      ],
      // initialSort: [{ column: "waiting", dir: "desc" }],
    });

    // function replaceData() {
    //   if (editing) return;
    //   table.replaceData(`${appUrl}/waitlist/${db}`);
    // }

    refreshInt = setInterval(
      () => refreshData("update", table, appUrl, db, editing),
      10000
    );
    // table.on("rowDeleted", async function (row) {

    //   console.log("table delete", socketId);
    //   var rowData = row.getData();
    //   var url = `${appUrl}/delete/${db}/${rowData._id}?socketId=${socketId}`;
    //   console.log(url);
    //   fetch(url, {
    //     method: "DELETE",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(rowData),
    //   });
    // });
    table.on("cellEditing", () => {
      editing = true;
      // console.log("cellEditing", { editing });
      // console.log('blocking redraw')
      // table.blockRedraw();
    });
    table.on("cellEditCancelled", () => {
      // table.restoreRedraw();
      editing = false;
      console.log("editCancelled", { editing });
      applyUpdates(table);
    });
    table.on("cellEdited", function (cell) {
      // table.restoreRedraw();
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
      editing = false;
      console.log("cellEdited", { editing }, "rowData", rowData);

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
      applyUpdates(table);
    });

    // table.on("historyUndo", (action, component, data) => {
    //   if (action !== "rowDelete") {
    //   }
    // });
    table.on("tableBuilt", function () {
      localStorage.setItem("updateQueue", JSON.stringify([]));
      $("#undo").on("click", function () {
        table.undo();
      });
      $("#redo").on("click", function () {
        table.redo();
      });
      $("#add-row").on("click", function () {
        addNewRow();
      });
      $("#refresh").on("click", function () {
        refreshData("replace", table, appUrl, db, editing);
      });
      $("#bug-report").on("click", () => {
        // showBugReport()
        let form = $("#bug-form");
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

      let deferredPrompt;
      window.addEventListener("beforeinstallprompt", (e) => {
        deferredPrompt = e;
        $('#install-app').show();
      });

      const installApp = document.getElementById("install-app");
      installApp.addEventListener("click", async () => {
        if (deferredPrompt !== null) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            deferredPrompt = null;
          }
        }
      });

      window
        .matchMedia("(display-mode: standalone)")
        .addEventListener("change", ({ matches }) => {
          if (matches) {
            $("#install-app").hide();
          } else {
            $("#install-app").show();
          }
        });

      channel.bind(`${db}Updated`, (update) => {
        if (editing) {
          update.action = "update";
          console.log("editing, storing update", update);
          storeUpdate(update);
          return;
        }
        let customer = update;
        console.log("update triggered", customer);
        let row;
        try {
          row = !!table
            .getColumn("_id")
            .getCells()
            .findIndex((c) => c._id === customer._id);
        } catch (err) {
          row = false;
          console.log(err);
        }
        console.log("row", row);
        if (!row) {
          console.log("row not found");
          // alert.play();
        }
        table.updateOrAddData([customer]);
      });

      channel.bind(`${db}Deleted`, (id) => {
        // console.log(id);
        // served.play();
        if (editing) {
          const update = { action: "delete", id };
          console.log("editing, storing update", update);
          storeUpdate(update);
          return;
        }
        let row = table.getRow(id);
        // console.log(row);
        if (!row) return;
        try {
          table.deleteRow(id);
        } catch (err) {}
      });
      channel.bind(`${db}Undo`, () => {
        table.undo();
      });
      channel.bind(`${db}Redo`, () => {
        table.redo();
      });

      const setWaiting = () => {
        let tableData = table.getData().filter((row) => !!row.submitted);
        // console.log(tableData);
        tableData.forEach((row) => {
          const id = row._id;
          const waiting = table.getRow(id).getCell("waiting");
          let start = DateTime.fromFormat(row.submitted, "F");
          let diff = DateTime.now().diff(start, "minutes");
          waiting.setValue(diff.minutes);
        });
      };
      setInterval(setWaiting, 1000);
    });

    function addNewRow() {
      const ObjectId = ObjectID().toHexString();
      table.addRow({ _id: ObjectId }).then((row) => {
        const lastRow = table.getRow(ObjectId);
        lastRow.getCell("name").edit();
      });
    }
  }

  render() {
    return (
      <div style={{ marginRight: 10 }}>
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
            {/* <audio controls><source src={alertAudio}></source></audio> */}
            {/* <button id="play-sound" className="button-29 buttons">
              Play Sound
            </button> */}
            <button id="install-app" className="button-29 buttons">
              Install
            </button>
            <button id="refresh" className="button-29 buttons">
              &#x27F3; Refresh Table
            </button>
          </span>
        </div>
        <div
          id="waitlist"
          className="striped compact myTable"
          ref={(tabulator) => (this.tabulator = tabulator)}
        />
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

export { refreshInt };
export default Waitlist;
