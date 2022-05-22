const FyersConnect = require('./src/FyersConnect');
const { notifyWebSocket } = require('./src/notify/WebSocketNotify');
const token = '2345678';

let fyersClient = new FyersConnect(token);
let strikeMapping = {};

const insertWebSocket = (ws, strike) => {
  if (!strikeMapping[strike]) {
    subscribeSymbols(strike);
    strikeMapping[strike] = [];
  }

  if(strikeMapping[strike].indexOf(ws) === -1) {
    strikeMapping[strike].push(ws);
  }
};

const removeWebSocket = (ws, strike) => {
  if (strikeMapping[strike]) {
    strikeMapping[strike] = strikeMapping[strike].filter(w => w !== ws);
  }

  if (strikeMapping[strike].length === 0) {
    fyersClient.unsubscribeSymbol(strike);
  } else {
    strikeMapping[strike].forEach(element => {
      element.send(`${ws.id} removed from strike ${strike}`);
    });
  }
};

const socketDisconnected = ws => {
  for (const strike in strikeMapping) {
    if (strikeMapping[strike].indexOf(ws) !== -1) {
      strikeMapping[strike] = strikeMapping[strike].filter(w => w !== ws);
    }
  }
}

const subscribeSymbols = symbol => {
  fyersClient.subscribeSymbol(symbol, (data) => {
    let lp = data['lp'].toFixed(2);
    sendDataToWebSocket(lp, symbol);
  });
}

const sendDataToWebSocket = (lp, strike) => {
  if (strikeMapping[strike]) {
    strikeMapping[strike].forEach(element => notifyWebSocket(element,lp, strike));
  }
}

module.exports = {
  insertWebSocket,
  removeWebSocket,
  socketDisconnected
};
