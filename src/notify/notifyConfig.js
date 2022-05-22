const moment = require('moment');

let intervalNotification = {};
let lastNotified = {};

const notificationSent = (id, strike) => {
  if(!lastNotified[id] || !lastNotified[id][strike]) {
    console.log("reached");
    return false;
  }

  const lastsent = lastNotified[id][strike];
  const now = moment();
  const diff = now.diff(lastsent, 'seconds');
  console.log(diff);
  return diff < intervalNotification[id]; 
}

const setNotificationInterval = (id, interval = 30) => {
  intervalNotification[id] = interval;
}

const setLastNotified = (id, strike) => {
  if(!lastNotified[id]) {
    lastNotified[id] = {};
  }
  lastNotified[id][strike] = moment();
}

module.exports = { notificationSent, setLastNotified, setNotificationInterval };
