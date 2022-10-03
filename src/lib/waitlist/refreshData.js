// import applyUpdates from "./applyUpdates.js";

const refreshData = (type, table, appUrl, db, editing) => {
  if (type === "replace") {
    console.log("replace triggered");
    table.replaceData(`${appUrl}/waitlist/${db}`);
    return;
  }
  if (editing) return
  // const updates = await applyUpdates(table);
  fetch(`${appUrl}/waitlist/${db}`).then((res) => {
    console.log("refresh", res);
    if (res.ok)
      res.json().then((data) => {
        if (!data) return;
        console.log(data);
        data.forEach((row) => {
          delete row.waiting;
        });
        table.updateOrAddData(data);
      });
  });
};

export default refreshData;


