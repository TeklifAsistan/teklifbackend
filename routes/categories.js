// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const generateUniqueId = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
// CREATE a new category
router.post('/', (req, res) => {
  const { title, parent,app, owner,userid, active, url } = req.body;

  // Generate a 6-digit unique number for the category ID
  const uniqueId = generateUniqueId();

  // Get the current timestamp for createdAt
  const createdAt = new Date();
  const updatedAt = new Date();

  // Modify the SQL query to include id and createdAt
  const sql = 'INSERT INTO categories (id, title, parent,app, owner, userid, active,createdAt,updatedAt, url) VALUES (?, ?, ?,?, ?,?, ?, ?,?,?)';
  
  // Pass the generated id and current timestamp along with other values
  db.query(sql, [uniqueId, title, parent, app, owner,userid, active,createdAt,updatedAt, url,], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err);

    }
    res.status(201).json({ message: 'Category created', categoryId: uniqueId });
  });
});

// READ all categories
router.get('/', (req, res) => {
  const { owner,app } = req.query; // Extract 'owner' from the query string

  let sql = 'SELECT * FROM categories';
  let queryParams = [];

  if (owner) {
    sql += ' WHERE owner = ?';
    queryParams.push(owner);
  }
  if (app) {
    sql += ' WHERE app = ?';
    queryParams.push(app);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// READ a single category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM categories WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('category not found');
    }
    res.json(results[0]);
  });
});

// UPDATE a category by ID

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedAt = new Date();
  const fields = req.body; // Get the fields from the request body

  // Start building the SQL query
  let sql = 'UPDATE categories SET ';
  const queryParams = [];

  // Loop through the fields and dynamically add them to the query
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      sql += `${key} = ?, `;
      queryParams.push(fields[key]);
    }
  }

  // Add updatedAt field
  sql += 'updatedAt = ? WHERE id = ?';
  queryParams.push(updatedAt, id);

  // Execute the query
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Category not found');
    }
    res.json({ message: 'Category updated successfully' });
  });
});

// router.put('/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, address } = req.body;
//   const sql = 'UPDATE categories SET name = ?, address = ? WHERE id = ?';
//   db.query(sql, [name, address, id], (err, results) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).send('category not found');
//     }
//     res.json({ message: 'category updated successfully' });
//   });
// });

// DELETE a category by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM categories WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('category not found');
    }
    res.json({ message: 'category deleted successfully' });
  });
});

module.exports = router;
