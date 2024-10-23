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
    name,
    surname,
    images,
    firm,
    firmId,
    field,
    phone,
    email,
    city,
    region,
    address,
    category,
    gender,
    age,
    salary,
    salaries,
    strengths,
    weaknesses,
    redLines,
    opinions,
    maritalStatus,
    amIinterested,
    lookingForJob,
    education,
    reward,
    fee,
    startedAt,
    capability,
    dataOwner,
    createdAt,
  } = req.body;


  const sql = `
    INSERT INTO personel (
    id,
    name,
    surname,
    images,
    firm,
    firmId,
    field,
    phone,
    email,
    city,
    region,
    address,
    category,
    gender,
    age,
    salary,
    salaries,
    strengths,
    weaknesses,
    redLines,
    opinions,
    maritalStatus,
    amIinterested,
    lookingForJob,
    education,
    reward,
    fee,
    startedAt,
    capability,
    dataOwner,
    createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )`;
      const imagesArray = images ? JSON.stringify(images) : null;
      const strengthsArray = strengths ? JSON.stringify(strengths) : null;
      const weaknessesArray = weaknesses ? JSON.stringify(weaknesses) : null;
      const redLinesArray = redLines ? JSON.stringify(redLines) : null;
      const opinionsArray = opinions ? JSON.stringify(opinions) : null;
      const rewardArray = reward ? JSON.stringify(reward) : null;
      const feeArray = fee ? JSON.stringify(fee) : null;
      const capabilityArray = capability ? JSON.stringify(capability) : null;
      const salaryArray = salary ? JSON.stringify(salary) : null;
      
      
      const values = [
        id,
        name,
        surname,
        imagesArray,
        firm,
        firmId,
        field,
        phone,
        email,
        city,
        region,
        address,
        category,
        gender,
        age,
        salary,
        salaryArray,
        strengthsArray,
        weaknessesArray,
        redLinesArray,
        opinionsArray,
        maritalStatus,
        amIinterested,
        lookingForJob,
        education,
        rewardArray,
        feeArray,
        startedAt,
        capabilityArray,
        dataOwner,
        new Date(), // createdAt
      ];

  db.query(sql, values, (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Aynı personel zaten mevcut.' }); // Duplicate barcode error message
      }
      
      console.log(err)

      return res.status(500).send(err);
    }
    res.json({ message: 'Person added successfully', id });
  });
});







router.post('/upload', upload.single('file'), (req, res) => {
  // Extract firmId from the query parameters
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
    const sheetName = workbook.SheetNames[0]; // Assuming single-sheet files
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const headerMapping = {
      'Stok Kodu *': 'stockCode',
      'Barkod *': 'barcode',
      'Ürün Adı *': 'productName',
      'Marka *': 'brand',
      'Fotoğraflar': 'images',
      'Açıklama': 'description',
      'Alış Fiyatı': 'purPrice',
      'Alış Kuru': 'purCurrency',
      'Satış Fiyatı *': 'price',
      'Satış Kuru': 'saleCurrency',
      'Stok *': 'stock',
      'Kritik Stok': 'criticStock',
      'Tax (Rakam ile) *': 'tax',
      'Menşe': 'origin',
      'İlgili Firma': 'relatedFirm',
      'Desi': 'desi',
      'Ölçüleri (en x boy x yük)': 'dimensions'
    };

    const transformedData = jsonData.map((item) => {
      const transformedItem = {};
      Object.keys(headerMapping).forEach((key) => {
        transformedItem[headerMapping[key]] = item[key] || null;
      });
      return transformedItem;
    });
    // Define the table name
    const tableName = `products_${firmId}`;
    const id = generateShortUUID();

    // Loop through the JSON data and insert into the database
    const promises = transformedData.map((product) => {
      const {
        stockCode, barcode, productName, brand, images, description, tags,
        price, stock, criticStock, bundle, tax,
        purPrice, saleCurrency, purCurrency, origin, relatedFirm,
        desi, dimensions,
      } = product;

      const sql = `INSERT INTO ${tableName} (
        id, stockCode, barcode, productName, brand,
        images,
        description,
        purPrice,
        purCurrency,
        price,
        saleCurrency,        
        stock,
        criticStock,
        tax,
        origin,
        relatedFirm,
        desi,
        dimensions,
        tags,
        content,
        teminTermin,
        active,
        onPremise,
        vulnerable,
        eCommerced,
        createdAt,
        updatedAt,
        url,
        formalPrice,
        prices,
        category,
        discount,
        onSale,
        bundle,
        source
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )`;

      // Convert arrays to strings, handle booleans as well
      const imagesArray = images ? JSON.stringify(images.split(',')) : null;
      //const tagsArray = tags ? JSON.stringify(tags.split(',')) : null;
      //const bundleArray = bundle ? JSON.stringify(bundle.split(',')) : null;


      const values = [
        id,
        stockCode, 
        barcode, 
        productName, 
        brand,
        imagesArray || '[]',
        description,
        purPrice,
        purCurrency,
        price,
        saleCurrency,
        stock,
        criticStock,
        tax,
        origin,
        relatedFirm,
        desi,
        dimensions,
        "[]",// tags
        '', // content
        '', // teminTermin
        true, // active
        false, // onPremise
        false, // vulnerable
        true, // eCommerced
        new Date(), // createdAt
        new Date(), // updatedAt
        '', // url
        0, // formalPrice
        '[]', // prices
        '', // category
        0, // discount
        false, // onSale
        '[]', //bundle
        '', // source
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
      .then(() => res.json({ message: 'Products uploaded successfully' }))
      .catch((error) => {
        console.log(error)
        res.status(500).send(error.message)});
  } catch (error) {
    return res.status(500).send('Error processing the file: ' + error.message);
  }
});


// READ all products
router.get('/', (req, res) => {
  const { firmId } = req.query; // Extract 'owner' from the query string

  const sql = `SELECT * FROM personel WHERE dataOwner = ${firmId}`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// READ a single product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  const tableName = `personel`;

  const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Person not found');
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
  let sql = `UPDATE personel SET `;
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
      return res.status(404).send('Person not found');
    }
    res.json({ message: 'Person updated successfully' });
  });
});


// DELETE a person by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  const tableName = `personel`;
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Person not found');
    }
    res.json({ message: 'Person deleted successfully' });
  });
});


module.exports = router;
