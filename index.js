const serialPort = require('serialport');
const express = require('express');
const db = require('./lib/data');

const app = express();
app.use(express.static('public'));

var opened = false;

app.get('/scan', (req,res) => {
  if (opened) {
    res.status(500);
    res.send('busy');
  } else {
    opened = true;
    var timeout = setTimeout((timeout) => {
      res.status(500);
      console.log('killed');
      res.send({value : -1, timestamp : Date.now()});
      opened = false;
      return false;
    },10000);
   
    var conn = new serialPort('/dev/ttyACM2', {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false
    });

    conn.write('s');

    conn.on('error', (err) => {
      console.log('serial comm error');
      console.log(err);
      conn.close();
      res.sendStatus(500);
      res.send({value : -1, timestamp : Date.now()});
      clearTimeout(timeout);
      opened = false;
      return false;
    });

    conn.on('open', () => {
      console.log('opened');
    });

    conn.on('data', (data) => {
      console.log(data);
      res.send({value : data.toString(), timestamp : Date.now()});
      conn.close();
      clearTimeout(timeout);
      opened = false;
      return true;
    });

  }
});

app.listen(9909, () => {
  db.initDB();
});
