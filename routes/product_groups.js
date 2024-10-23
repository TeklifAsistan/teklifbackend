// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');


const generateUniqueId = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// CREATE a new product_group
router.post('/', (req, res) => {
  const { title, parent,app, owner,userid, active, url } = req.body;

  // Get the current timestamp for createdAt
  const uniqueId = generateUniqueId();

  const createdAt = new Date();

  // Modify the SQL query to include id and createdAt
  const sql = 'INSERT INTO product_groups (id, title, owner, userid, createdAt, url) VALUES (?, ?, ?, ?, ?, ?)';
  
  // Pass the generated id and current timestamp along with other values
  db.query(sql, [ uniqueId, title, owner,userid, createdAt, url,], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err);

    }
    res.status(201).json({ message: 'Product Group created', product_group: title });
  });
});

// READ all product_groups
router.get('/', (req, res) => {
  const { owner,app } = req.query; // Extract 'owner' from the query string

  let sql = 'SELECT * FROM product_groups';
  let queryParams = [];

  if (owner) {
    sql += ' WHERE owner = ?';
    queryParams.push(owner);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// READ a single product_group by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM product_groups WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('product group not found');
    }
    res.json(results[0]);
  });
});

// UPDATE a product_group by ID

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body; // Get the fields from the request body

  // Start building the SQL query
  let sql = 'UPDATE product_groups SET ';
  const queryParams = [];

  // Loop through the fields and dynamically add them to the query
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      sql += `${key} = ?, `;
      queryParams.push(fields[key]);
    }
  }

  // Remove the last comma and space from the SQL query
  sql = sql.slice(0, -2); // Remove the last comma and space

  // Add the WHERE clause
  sql += ' WHERE id = ?';
  queryParams.push(Number(id));

  // Execute the query
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Product Group not found');
    }
    res.json({ message: 'Product Group updated successfully' });
  });
});


// DELETE a product_group by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM product_groups WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Product Group not found');
    }
    res.json({ message: 'Product Group deleted successfully' });
  });
});

module.exports = router;
