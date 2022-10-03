const applyUpdates = (table) => {
  console.log('applyUpdates triggered')
  const updateQueue = JSON.parse(localStorage.getItem("updateQueue")) || [];
  console.log("updateQueue",updateQueue, updateQueue.length);
  // if (updateQueue.length === 0) return;
  updateQueue.forEach((update) => {
    const { action } = update;
    console.log("action", action);
    switch (action) {
      case "update":
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
        return;
      case "delete":

        const id = update.id;
        console.log("delete triggered", update, id);
        let deleteRow = table.getRow(id);
        // console.log(row);
        if (!deleteRow) return;
        try {
          table.deleteRow(id);
        } catch (err) {}
        return;
      default:
        return;
    }
  });
  localStorage.setItem("updateQueue", JSON.stringify([]));
  return updateQueue;
};

export default applyUpdates;
