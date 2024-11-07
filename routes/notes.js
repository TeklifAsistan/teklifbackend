// routes/offerNotes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');


// CREATE a new tag
router.post('/', (req, res) => {
  const { id, text, app, owner, userid, tags } = req.body;



  const sql = 'INSERT INTO notes (id, text, app, owner, userid, tags, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';

  const tagsArray = tags ? JSON.stringify(tags) : null;

  db.query(sql, [id, text, app, owner, userid, tagsArray, new Date()], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err);

    }
    res.status(201).json({ message: 'Note created', noteId: id });
  });
});

// READ all notes
router.get('/', (req, res) => {
  const { firmId,app } = req.query; // Extract 'firmId' from the query string

  let sql = 'SELECT * FROM notes';
  let queryParams = [];

  if (firmId) {
    sql += ' WHERE owner = ?';
    queryParams.push(firmId);
  }
  if (app) {
    // If firmId was already added, use "AND" instead of "WHERE"
    sql += firmId ? ' AND app = ?' : ' WHERE app = ?';
    queryParams.push(app);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Count
router.get('/count', (req, res) => {
  const { firmId,app } = req.query;

  let sql = 'SELECT COUNT(*) AS count FROM notes';
  let queryParams = [];

  if (firmId) {
    sql += ' WHERE owner = ?';
    queryParams.push(firmId);
  }
  if (app) {
    sql += firmId ? ' AND app = ?' : ' WHERE app = ?';
    queryParams.push(app);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ count: results[0].count });
  });
});

// READ a single category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM notes WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('note not found');
    }
    res.json(results[0]);
  });
});

// UPDATE a category by ID

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body; // Get the fields from the request body

  // Start building the SQL query
  let sql = 'UPDATE notes SET ';
  const queryParams = [];

  // Loop through the fields and dynamically add them to the query
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      sql += `${key} = ?, `;
      queryParams.push(fields[key]);
    }
  }

  // Remove trailing comma and space, then add WHERE clause
  sql = sql.slice(0, -2) + ' WHERE id = ?';
  queryParams.push(id);

  // Execute the query
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Note not found');
    }
    res.json({ message: 'Note updated successfully' });
  });
});
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM notes WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('note not found');
    }
    res.json({ message: 'note deleted successfully' });
  });
});

module.exports = router;
