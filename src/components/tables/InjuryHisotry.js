import React, { Component } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables"; 
import Pusher from "pusher-js";
import "../../index.css";
import { DateTime } from "luxon";
import $ from 'jquery'

const production = process.env.NODE_ENV === 'production' ? true:false

console.log(production);

const pusher = new Pusher("292d5c10fab755578a14", {
  cluster: "us2",
});

const pChannel = production === true ? "Playmakers" : "test";
const channel = pusher.subscribe(pChannel);

const db = 'InjuryHistory'
class InjuryHistory extends Component {
  componentDidMount() {
    // eslint-disable-next-line
    const recycle = function (cell, formatterParams, onRendered) {
      return '<button id="check" !disabled class="button-29" type="button" style="font-size:20px;width:45px;height:35px">♻</button>';
    };
    let socketId;
    pusher.connection.bind("connected", () => {
      socketId = pusher.connection.socket_id;
      console.log('History', socketId);
    });

    const deleteContext = [
      {
        label: "Delete from History",
        action: (e, cell) => {
          const row = cell.getRow();
          // rowData.name = "deleteHistory";
          row.delete();
        },
      },
    ];

    const appUrl =
      production === true
        ? "https://pm-waitlist.herokuapp.com"
        : "http://localhost:5000";
    console.log(appUrl);
    let historyTable = new Tabulator(this.tabulator, {
      ajaxURL: `${appUrl}/waitlist/${db}`,
      pagination: true,
      paginationSize: 10,
      paginationCounter: "rows",
      layout: "fitColumns", //fit columns to width of table
      responsiveLayout: "hide",
      history: true, //allow undo and redo actions on the table
      height: 560,
      movableRows: false,
      // tabEndNewRow: true,
      autoResize: true,
      addRowPos: "top",
      index: "_id",
      placeholder: "Build it and they will come",
      columnDefaults: {
        editable: false, 
      },
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
          title: "Waited",
          field: "waiting",
          headerHozAlign: "center",
          headerSort: true,
          minWidth: 50,
          width: 100,
          // widthShrink: 1,
          responsive: 0,
          hozAlign: "center",
        },
        {
          title: "Location",
          field: "location",
          minWidth: 50,
          width: 150,
          // widthShrink: 1,
          // responsive: 0,
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
              "Man Cave",
              "Boutique",
              "W Sale",
              "Coach's",
            ],
            autocomplete: true,
            listOnEmpty: true,
            freetext: true,
            verticalNavigation: "editor",
            clearable: true,
          },
        },
        {
          visible: false,
          title: "Phone",
          field: "phone",
          editor: "input",
          hozAlign: "center",
          headerHozAlign: "center",
          width: 150,
          // widthShrink: 1,
          minWidth: 50,
          maxWidth: 200,
          responsive: 2,
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
          formatter: recycle,
          field: "check",
          width: 75,
          responsive: 0,
          hozAlign: "center",
          headerSort: false,
          cellClick: function (e, cell) {
            let customer = cell.getRow().getData();
            let id = customer._id;
            let waitlist = $("#locations input:radio:checked").val();
            waitlist = production ? waitlist:'test'
            let url = `${appUrl}/update/${waitlist}/${id}`;
            console.log({waitlist})
            // console.log(url);
            fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(customer),
            });
          },
        },
        { title: "id", field: "_id", visible: false },
        {
          title: "Submitted",
          field: "submitted",
          visible: true,
          width: 100,
          formatter: (cell) => {
            // console.log(cell.getValue())
            let time = DateTime.fromFormat(cell.getValue(), "F").toLocaleString(
              DateTime.TIME_WITH_SECONDS
            );
            // console.log(time)
            return time;
          },
        },
        {
          title: "Served",
          field: "served",
          visible: true,
          width: 100,
          // sorter: "time",
          // sorterParams: {
          //   format: "h:mm:ss A",
          //   alignEmptyValues: "bottom",
          //   // formatter: (cell) => {
          //   //   return DateTime.fromFormat(cell.getValue(), "tt").toFormat(
          //   //     "tt"
          //   //   );
          //   // }
          // },
        },
        {
          formatter: "buttonCross",
          width: 50,
          hozAlign: "center",
          clickMenu: deleteContext,
        },
      ],
      initialSort: [{ column: "served", dir: "desc" }],
      initialFilter: [
        {
          field: "submitted",
          type: "like",
          value: DateTime.now().toFormat("D"),
        },
      ],
    });

    historyTable.on("rowDeleted", (row) => {
      let rowData = row.getData();

      var url = `${appUrl}/delete/${db}/${rowData._id}?socketId=${socketId}`;
      // console.log(url);
      fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });
    });

    historyTable.on("tableBuilt", function () {
      channel.bind(`${db}Deleted`, (id) => {
        let row = historyTable.getRow(id);
        console.log('delete history',{row})
        if (!row) return;
        try {
          historyTable.deleteRow(id);
        } catch (err) {}
      });
      channel.bind(`${db}Updated`, (data) => {
        console.log("history update received", data);
        let customer = data.customer;
        console.log("customer", customer);
        historyTable.updateOrAddData([customer]);
      });
    // let history = document.querySelector(".history");
    //   history.style.display = "none";
    });
  }

  render() {
    return (
      <div>
        <div
          id="history"
          className="history striped compact myTable"
          ref={(tabulator) => (this.tabulator = tabulator)}
        />{" "}
      </div>
    );
  }
}

export default InjuryHistory;
