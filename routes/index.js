// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from SQL backend');
});

module.exports = router;
