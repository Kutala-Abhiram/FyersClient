const fyers = require('fyers-api-v2');
const appId = '7LOU14HO6Y-100';
const secretKey = 'POKBUT9WGL';
const updateSymbol = 'symbolUpdate';

module.exports = class FyersConnect {
  constructor(token) {
    fyers.setAppId(appId);
    fyers.setAccessToken(token);
    this.token = token;
  }

  subscribeSymbol(symbol, callback) {
    let reqBody = { token: this.token, dataType: updateSymbol, symbol: [symbol] };
      
    fyers.fyers_connect(reqBody, (websocketData) => {
      let parsedData = JSON.parse(websocketData);
      if(parsedData && parsedData["s"] === "ok" && parsedData["d"] !== null && parsedData["d"]["7208"] !== null) {
        let firstMarketData = parsedData["d"]["7208"][0];

        if(firstMarketData) {
          if (firstMarketData["s"] == "ok" && firstMarketData["v"] && firstMarketData["v"]["lp"]) {
            callback(firstMarketData["v"]);
          } else {
            console.log("wrong data from fyers");
          }
        }
      }
    });
  }

  unsubscribeSymbol(symbol) {
    let reqBody = { token: fyersConfig.token, dataType: dataType, symbol: [symbol] };
    return fyers.fyers_unsuscribe(reqBody);
  }

  async customQuotes(symbols) {
    let quotes = new fyers.quotes();
    let quoteSymbols =  await quotes.setSymbol(symbols.toString()).getQuotes();
    console.log(quoteSymbols);
    let parsedData = quoteSymbols;

    if(parsedData && parsedData["s"] === "ok" && parsedData["d"] !== null) {
      return parsedData["d"];
    }
  }
}
