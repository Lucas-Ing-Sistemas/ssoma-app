const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

function getPool() {
  if (!pool) {
    const host = process.env.DB_HOST || 'localhost';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

    pool = mysql.createPool({
      host: host,
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: isLocal
        ? false
        : {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
    });
  }
  return pool;
}

module.exports = { getPool };









// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   port: parseInt(process.env.DB_PORT || '3306', 10),
//   database: process.env.DB_NAME || 'dev_ssoma',
//   waitForConnections: true,
//   connectionLimit: 15,
//   queueLimit: 0,
//   decimalNumbers: true
// };

// let pool;

// function getPool() {
//   if (!pool) {
//     pool = mysql.createPool(dbConfig);
//   }
//   return pool;
// }

// module.exports = {
//   getPool,
//   dbConfig
// };
