// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const xlsx = require('xlsx');
const crypto = require('crypto');



const upload = multer({ dest: 'uploads/' });

// function generateShortUUID() {
//   return crypto.randomBytes(4).toString('hex').slice(0, 7);
// }
function generateShortUUID() {
  const min = 1000000; // Minimum 7-digit number (inclusive)
  const max = 9999999; // Maximum 7-digit number (inclusive)
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

// CREATE a new product
router.post('/', (req, res) => {
  const {
    id,
    firmName,
    dataOwner,
    images,
    sector,
    city,
    region,
    address,
    type,
    category,
    segment,
    priority,
    phone,
    email,
    linkedin,
    xUrl,
    instagram,
    webURL,
    strengths,
    weaknesses,
    redLines,
    opinions,
    personel,
    authorized,
  } = req.body;


  const sql = `
    INSERT INTO firms (
    id,
    firmName,
    dataOwner,
    images,
    sector,
    city,
    region,
    address,
    type,
    category,
    segment,
    priority,
    phone,
    email,
    linkedin,
    xUrl,
    instagram,
    webURL,
    strengths,
    weaknesses,
    redLines,
    opinions,
    personel,
    authorized
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )`;
      const sectorArray = sector ? JSON.stringify(sector) : null;
      const imagesArray = images ? JSON.stringify(images) : null;
      const strengthsArray = strengths ? JSON.stringify(strengths) : null;
      const weaknessesArray = weaknesses ? JSON.stringify(weaknesses) : null;
      const redLinesArray = redLines ? JSON.stringify(redLines) : null;
      const opinionsArray = opinions ? JSON.stringify(opinions) : null;
      const personelArray = personel ? JSON.stringify(personel) : null;
      const authorizedArray = authorized ? JSON.stringify(authorized) : null;
      
      
      const values = [
        id,
        firmName,
        dataOwner,
        imagesArray,
        sectorArray,
        city,
        region,
        address,
        type,
        category,
        segment,
        priority,
        phone,
        email,
        linkedin,
        xUrl,
        instagram,
        webURL,
        strengthsArray,
        weaknessesArray,
        redLinesArray,
        opinionsArray,
        personelArray,
        authorizedArray,
      ];

  db.query(sql, values, (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Aynı firma zaten mevcut.' }); // Duplicate barcode error message
      }
      
      console.log(err)

      return res.status(500).send(err);
    }
    res.json({ message: 'Firm added successfully', id });
  });
});






router.post('/upload', upload.single('file'), async (req, res) => {
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const headerMapping = {
      'Firma Adı': 'firmName',
      'Sektör': 'sector',
      'İl': 'city',
      'İlçe': 'region',
      'Telefon': 'phone',
      'E-Posta': 'email',
      'Adres': 'address',
    };

    const transformedData = jsonData.map((item) => {
      const transformedItem = {};
      Object.keys(headerMapping).forEach((key) => {
        transformedItem[headerMapping[key]] = item[key] || null;
      });
      return transformedItem;
    });

    // Get all existing firm names from the database
    const [existingFirms] = await db.promise().query(
      'SELECT firmName FROM firms WHERE dataOwner = ?', [firmId]
    );    
    const existingFirmNames = new Set(existingFirms.map((firm) => firm.firmName.toLowerCase()));

    // Filter out duplicates from the transformed data based on firmName
    const uniqueData = transformedData.filter((firm) => {
      const firmName = firm.firmName && firm.firmName.toLowerCase();
      if (firmName && !existingFirmNames.has(firmName)) {
        existingFirmNames.add(firmName); // Add to set to avoid duplicates in the input data
        return true;
      }
      return false; // Skip if duplicate
    });

    const tableName = `firms`;

    // Prepare insert promises for each unique firm
    const promises = uniqueData.map((firm) => {
      const {
        firmName, sector, city, region, phone, email, address
      } = firm;

      // Generate a unique ID for each row
      const id = generateShortUUID();

      const sql = `INSERT INTO ${tableName} (
        id,
        firmName,
        dataOwner,
        images,
        sector,
        city,
        region,
        address,
        type,
        category,
        segment,
        priority,
        phone,
        email,
        linkedin,
        xUrl,
        instagram,
        webURL,
        strengths,
        weaknesses,
        redLines,
        opinions,
        personel,
        authorized
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )`;

      const sectorArray = sector ? JSON.stringify(sector.split(',')) : null;

      const values = [
        id,
        firmName,
        firmId,
        null,
        sectorArray,
        city,
        region,
        address,
        null,
        null,
        null,
        null,
        phone,
        email,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];

      return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });

    // Execute all insertions
    Promise.all(promises)
      .then(() => res.json({ message: 'Firms uploaded successfully, avoiding duplicates.' }))
      .catch((error) => {
        console.log(error);
        res.status(500).send(error.message);
      });
  } catch (error) {
    return res.status(500).send('Error processing the file: ' + error.message);
  }
});



// READ all products
router.get('/', (req, res) => {
  const { firmId } = req.query; // Extract 'owner' from the query string

  const sql = `SELECT * FROM firms WHERE dataOwner = ${firmId}`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

router.get('/count', (req, res) => {
  const { firmId } = req.query;

  let sql = 'SELECT COUNT(*) AS count FROM firms';
  let queryParams = [];

  if (firmId) {
    sql += ' WHERE dataOwner = ?';
    queryParams.push(firmId);
  }
  

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ count: results[0].count });
  });
});


// READ a single product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  const tableName = `firms`;

  const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }
    res.json(results[0]);
  });
});

// UPDATE a product by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query; // firmId comes from query
  const updatedFields = req.body; // Contains the fields to be updated

  if (!firmId) {
    return res.status(400).send('firmId is required');
  }

  if (!Object.keys(updatedFields).length) {
    return res.status(400).send('No fields to update');
  }

  // Prepare dynamic SQL query
  let sql = `UPDATE firms SET `;
  const sqlValues = [];

  // Iterate through the updated fields and build the query dynamically
  for (const field in updatedFields) {
    sql += `${field} = ?, `;
    sqlValues.push(updatedFields[field]);
  }

  // Remove trailing comma and space
  sql = sql.slice(0, -2);

  // Add WHERE clause
  sql += ' WHERE id = ?';
  sqlValues.push(id);

  // Execute the query
  db.query(sql, sqlValues, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Firm not found');
    }
    res.json({ message: 'Firm updated successfully' });
  });
});


// DELETE a firm by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  const tableName = `firms`;
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Firm not found');
    }
    res.json({ message: 'Firm deleted successfully' });
  });
});


module.exports = router;
