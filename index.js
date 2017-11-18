const serialPort = require('serialport');
const express = require('express');
const db = require('./lib/data');
const path = require('path');
const config = require('./config');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var opened = false;

app.get('/scan', (req,res) => {
  var amountSamples = 5;
  var samplesTaken = 0;
  var total = 0;

  if (req.query.samples) {
    amountSamples = req.query.samples;
  }

  if (opened) {
    res.status(500);
    res.send('busy');
  } else {
    opened = true;
    var timeout = setTimeout((timeout) => {
      opened = false;
      res.end();
      return false;
    },30000);
   
    var conn = new serialPort(config.port, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false
    });

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
      console.log(amountSamples);
      console.log(data);
      total += Number(data);
      samplesTaken++;

      if (samplesTaken == amountSamples) {
        res.send({value : total/samplesTaken, timestamp : Date.now(), samples : samplesTaken});
        conn.close();
        clearTimeout(timeout);
        opened = false;
        return true;
      }
    });
  }
});

app.use('/client/', express.static(path.dirname(require.main.filename) + '/client'));
//app.use('/', express.static('client'));

app.listen(9909, () => {
  db.initDB();
});
