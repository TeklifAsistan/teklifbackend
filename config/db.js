// config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '217.131.8.75',
  //host:"127.0.0.1",
  user: 'faruk',
  password: 'Faruk7093',
  database: 'teklifapp',
  port: 3306 // Default MySQL port
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL!');
});

module.exports = db;
