const { insertWebSocket, removeWebSocket, socketDisconnected } = require('./factory');
const { setNotificationInterval } = require('./src/notify/notifyConfig');

const WebSocketServer = require('ws');

const wss = new WebSocketServer.Server({ port: 8080 });

const strikeManager = (ws, data) => {
  switch(data.operation) {
    case 'buy':
      insertWebSocket(ws, data.strike);
      break;
    case 'sell':
      removeWebSocket(ws, data.strike);
      break;
    case 'interval':
      setNotificationInterval(ws.id, data.time_in_sec);
      break;
    default:
      break;
  }
}

wss.on('connection', ws => {
  ws.id = ws._socket._handle.fd;
  setNotificationInterval(ws.id);

  ws.on('message', data => {
    const originalData = data.toString(); 
    const message = JSON.parse(originalData);
    strikeManager(ws, message);
  });

  ws.on('close', () => {
    socketDisconnected(ws);
  });
});
