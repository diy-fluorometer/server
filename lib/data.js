const db = require('sqlite3');
const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = {
  
  getDB() {
    return path.dirname(require.main.filename) + '/db.sqlite3';
  },

  initDB() {
    var db = new sqlite3.Database(this.getDB());
    db.serialize(() => {
      try {
        db.run("CREATE TABLE IF NOT EXISTS samples (id integer primary key autoincrement, label varchar(255), value float)");
        return true;
      } catch(err) {
        console.log(err);
        return false;
      }
    });
  },

  writeSample(name,value,timestamp) {
    if (!timestamp) timestamp = Date.now;
    var db = new sqlite3.Database(this.getDB());
    db.serialize(() => {
      db.run("INSERT INTO foo VALUES (?)", 1, function() {});
    });
  }
}
