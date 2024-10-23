const express = require('express');
const router = express.Router();
const db = require('../config/db');

// General function to log actions
const addLog = (owner,userid, actionType, details) => {
  return new Promise((resolve, reject) => {
    // Define the log table name based on the user ID
    const logTableName = `Logs_${owner}_${userid}`;

    // Check if the log table exists
    const checkTableExists = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = ? LIMIT 1
    `;

    db.query(checkTableExists, [logTableName], (err, result) => {
      if (err) return reject(err);

      // If table doesn't exist, create it
      if (result.length === 0) {
        const createTableSql = `
          CREATE TABLE ${logTableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            actionType VARCHAR(255),
            details TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `;
        db.query(createTableSql, (err) => {
          if (err) return reject(err);

          // After creating the table, insert the log
          insertLog(logTableName, actionType, details, resolve, reject);
        });
      } else {
        // Table exists, insert the log
        insertLog(logTableName, actionType, details, resolve, reject);
      }
    });
  });
};

// Function to insert log entry
const insertLog = (tableName, actionType, details, resolve, reject) => {
  const insertLogSql = `
    INSERT INTO ${tableName} (actionType, details) VALUES (?, ?)
  `;
  db.query(insertLogSql, [actionType, details], (err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
};

const getLogs = (owner, userid, isFirmOwner) => {
    return new Promise((resolve, reject) => {
      if (isFirmOwner==="true") {
        // Fetch all log tables starting with `Logs_${owner}_`
        const getTablesSql = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name LIKE 'Logs_${owner}_%'
        `;
  
        db.query(getTablesSql, (err, tables) => {
          if (err) return reject(err);
  
          if (tables.length === 0) {
            return resolve([]); // No log tables found for the firm
          }
  
          // Fetch logs from each table and combine them
          const allLogsPromises = tables.map(table => {
            const tableName = table.table_name;
            return new Promise((resolve, reject) => {
              const fetchLogsSql = `SELECT * FROM ${tableName} ORDER BY createdAt DESC`;
              db.query(fetchLogsSql, (err, logs) => {
                if (err) return reject(err);
                resolve(logs);
              });
            });
          });
  
          // Combine logs from all tables
          Promise.all(allLogsPromises)
            .then(logsArrays => {
              const combinedLogs = [].concat(...logsArrays); // Merge logs arrays
              resolve(combinedLogs);
            })
            .catch(reject);
        });
      } else {
        // Fetch logs for a specific user only
        const logTableName = `Logs_${owner}_${userid}`;
        const checkTableExists = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name = ? LIMIT 1
        `;
        db.query(checkTableExists, [logTableName], (err, result) => {
          if (err) return reject(err);
  
          if (result.length > 0) {
            const fetchLogsSql = `SELECT * FROM ${logTableName} ORDER BY createdAt DESC`;
            db.query(fetchLogsSql, (err, logs) => {
              if (err) return reject(err);
              resolve(logs);
            });
          } else {
            resolve([]); // No logs found for the specific user
          }
        });
      }
    });
  };
  
  // Route to fetch logs
  router.get('/logs', async (req, res) => {
    const { owner, userid, isFirmOwner } = req.query;
  
    try {
      const logs = await getLogs(owner, userid, isFirmOwner);
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
router.post('/log', async (req, res) => {
    const { owner,userid, actionType, details } = req.body;
  
    try {
      await addLog(owner,userid, actionType, details);
      res.status(200).json({ message: 'Log added successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add log' });
    }
  });

  module.exports = router;
