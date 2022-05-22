const { notificationSent, setLastNotified } = require("./notifyConfig");

const notifyWebSocket = (ws, lp, strike) => {
  if(notificationSent(ws.id, strike)) {
    return;
  }

  const message = { lp, strike };
  ws.send(JSON.stringify(message));
  setLastNotified(ws.id, strike);
}

module.exports = { notifyWebSocket };
