import React from "react";
import { Routes, Route } from "react-router-dom";
import HistoryTable from "../components/tables/HistoryTable.js";
import InjuryHitory from "../components/tables/InjuryHisotry.js";

function History() {
  
  return (
    <Routes>
      <Route path="/" element={<HistoryTable />} />
      <Route path="/injuryClinic" element={<InjuryHitory />} />
    </Routes>
  );
}

export default History