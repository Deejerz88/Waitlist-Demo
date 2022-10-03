import React from "react";
import Waitlist from "../components/tables/Waitlist.js";
import InjuryClinic from "../components/tables/InjuryClinic.js";
import { Routes, Route } from "react-router-dom";

function Table() {
  return (
    <Routes>
      <Route path='/' element={<Waitlist />} />
      <Route path='/InjuryClinic' element={<InjuryClinic/>} />
    </Routes>
  )
}

export default Table