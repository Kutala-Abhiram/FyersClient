const FyersConnect = require('./src/FyersConnect');
const { notifyWebSocket } = require('./src/notify/WebSocketNotify');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NTMzNjIzNTQsImV4cCI6MTY1MzQzODYxNCwibmJmIjoxNjUzMzYyMzU0LCJhdWQiOlsiZDoxIiwiZDoyIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCaWpFNnlTR3dFZlJCbjJqM1NrTkI4V1JnaVlFSnMya2wtZVNVS0dmNUg1b2VkRGx3M0xBamN1VDBKTXU1RldYVmxZSmVEemcyMGxRQV9fSlV4MjNnZi1sTGtWdTBTN3ZqUWJrU2VfWXc3cXprRUdDOD0iLCJkaXNwbGF5X25hbWUiOiJLVVRBTEEgQUJISVJBTSIsImZ5X2lkIjoiWEswNDMyOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.23_6__oAZRjGzjz3Xsqs5RUkgdAd7VIQdaXIUz6xz_c';

let fyersClient = new FyersConnect(token);
let strikeMapping = {};

const insertWebSocket = (ws, strike) => {
  if (!strikeMapping[strike]) {
    strikeMapping[strike] = [];
  }

  if(strikeMapping[strike].length === 0) {
    subscribeSymbols(strike);
  }

  if(strikeMapping[strike].indexOf(ws) === -1) {
    strikeMapping[strike].push(ws);
  }
};

const removeWebSocket = (ws, strike) => {
  if (strikeMapping[strike]) {
    strikeMapping[strike] = strikeMapping[strike].filter(w => w !== ws);

    if (strikeMapping[strike].length === 0) {
      fyersClient.unsubscribeSymbol(strike);
    } else {
      strikeMapping[strike].forEach(element => {
        element.send(`${ws.id} removed from strike ${strike}`);
      });
    }
  }
};

const socketDisconnected = ws => {
  for (const strike in strikeMapping) {
    if (strikeMapping[strike].indexOf(ws) !== -1) {
      removeWebSocket(ws, strike);
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
