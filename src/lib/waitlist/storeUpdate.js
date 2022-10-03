
const storeUpdate = (update) => {
  const updateQueue = JSON.parse(localStorage.getItem('updateQueue')) || '[]';
  updateQueue.push(update);
  localStorage.setItem('updateQueue', JSON.stringify(updateQueue));
}

export default storeUpdate;