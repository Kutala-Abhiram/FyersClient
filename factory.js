const FyersConnect = require('./src/FyersConnect');
const { notifyWebSocket } = require('./src/notify/WebSocketNotify');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2NTM3MzE3NDksImV4cCI6MTY1Mzc4NDI0OSwibmJmIjoxNjUzNzMxNzQ5LCJhdWQiOlsiZDoxIiwiZDoyIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCaWtmR2xnRkNJeUdvX1hiYVZMbm1hTWJUOTI0S08zSHBKWGJkbXE5YUJ5NjZDdEIzOW9CZDNtQllsRTF2Ynlsak9VTHZMQnViMTRNTk9hdW9jMVZJclZWMllOd05nb0N4enlHRHFURDNJY1RUMGd2VT0iLCJkaXNwbGF5X25hbWUiOiJLVVRBTEEgQUJISVJBTSIsImZ5X2lkIjoiWEswNDMyOCIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.GDhCWRDBJz8Pv64RO6jJOghJGKU572PuoO6GY3MQ34E';

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

const getQuotes = async quotes => {
  data = await fyersClient.customQuotes(quotes);
  return data;
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
  socketDisconnected,
  getQuotes
};
