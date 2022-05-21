let strikeMapping = {};

const insertWebSocket = (ws, strike) => {
  if (!strikeMapping[strike]) {
    strikeMapping[strike] = [];
  } else {
    console.log('strikeMapping[strike]', strikeMapping);
    strikeMapping[strike].forEach(element => {
      element.send(`${ws.id} added to strike ${strike} -- ${strikeMapping}`);
    });
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

module.exports = {
  insertWebSocket,
  removeWebSocket,
  socketDisconnected
};
