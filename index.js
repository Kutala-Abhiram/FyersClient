const express = require('express');
const cors = require('cors');
const WebSocketServer = require('ws');
const { insertWebSocket, removeWebSocket, socketDisconnected, getQuotes } = require('./factory');
const { setNotificationInterval } = require('./src/notify/notifyConfig');

const wss = new WebSocketServer.Server({ port: 8080 });

const strikeManager = (ws, data) => {
  switch(data.operation) {
    case 'add':
      insertWebSocket(ws, data.strike);
      break;
    case 'remove':
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

const app = express();

app.use(express.json());

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors());
app.post('/getQuotes', async (req, res) => {
  const { symbols } = req.body;
  const data = await getQuotes(symbols);
  res.status(200).send(data);
});


app.listen(3101, () => {
  console.log('Options Strategies app listening on port 3101!');
});
