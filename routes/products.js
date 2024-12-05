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

function convertToSlug(title) {
  // Define a map to replace Turkish characters with English equivalents
  const turkishMap = {
    'Ç': 'C', 'Ö': 'O', 'Ş': 'S', 'İ': 'I', 'Ü': 'U', 'Ğ': 'G',
    'ç': 'c', 'ö': 'o', 'ş': 's', 'ı': 'i', 'ü': 'u', 'ğ': 'g'
  };

  // Replace Turkish characters
  let slug = title.replace(/[ÇÖŞİÜĞçöşüğı]/g, (char) => turkishMap[char] || char);

  // Convert to lowercase, remove non-alphanumeric characters except for hyphens, and replace spaces with hyphens
  slug = slug.toLowerCase()
             .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
             .trim()
             .replace(/\s+/g, '-');         // Replace spaces with hyphens

  return slug;
}

// CREATE a new product
router.post('/', (req, res) => {
  const {
    id,
    stockCode,
    barcode,
    productName,
    brand,
    images,
    description,
    content,
    url,
    tags,
    price,
    stock,
    criticStock,
    category,
    bundle,
    tax,
    source,
    teminTermin,
    purPrice,
    saleCurrency,
    purCurrency,
    origin,
    relatedFirm,
    desi,
    dimensions,
    onSale,
    active,
    onPremise,
    vulnerable,
    eCommerced,
    firmId,
    unit,
    warranty,
    mbf,//must be followed
    mbfPeriod,
    PBSList,

  } = req.body;


  const sql = `
    INSERT INTO products_${firmId} (
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
        source,
        unit,
        warranty,
        mbf,
        mbfPeriod,
        PBSList

      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )`;
      const imagesArray = images ? JSON.stringify(images.split(',')) : null;
      const tagsArray = tags ? JSON.stringify(tags.split(',')) : null;
      const PBSListArray = PBSList ? JSON.stringify(PBSList.split(',')) : null;
      let bundleArray;
      if (Array.isArray(bundle)) {
        bundleArray = JSON.stringify(bundle); // If it's an array, convert it to a JSON string
      } else if (typeof bundle === 'string') {
        bundleArray = JSON.stringify(bundle.split(',')); // If it's a string, split it
      } else {
        bundleArray = null; // Handle cases where bundle is null or undefined
      }
      const values = [
        id,
        stockCode, 
        barcode, 
        productName, 
        brand,
        imagesArray,
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
        tagsArray,// tags
        content, // content
        teminTermin, // teminTermin
        active || true, // active
        onPremise, // onPremise
        vulnerable, // vulnerable
        eCommerced, // eCommerced
        new Date(), // createdAt
        new Date(), // updatedAt
        url, // url
        "0", // formalPrice
        '[]', // prices
        category, // category
        "0", // discount
        onSale, // onSale
        bundleArray, //bundle
        source, // source
        unit,
        warranty,
        mbf,
        mbfPeriod,
        PBSListArray
      ];

  db.query(sql, values, (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Aynı barkod zaten mevcut.' }); // Duplicate barcode error message
      }
      
      console.log(err)

      return res.status(500).send(err);
    }
    res.json({ message: 'Product added successfully', id });
  });
});


router.post('/create-table', async (req, res) => {
  const { firmId } = req.body;

  if (!firmId) {
    return res.status(400).json({ message: 'firmId is required' });
  }

  // Define the table name based on the firmId
  const tableName = `products_${firmId}`;

  // Query to check if the table exists
  const checkTableSql = `
    SELECT COUNT(*) AS tableCount 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = '${tableName}';
  `;

  try {
    // Use promise-based query method
    const [rows] = await db.promise().query(checkTableSql);
    const tableExists = rows[0].tableCount > 0;

    if (!tableExists) {
      // SQL query to create the products table for the specific firm
      const createTableSql = `
        CREATE TABLE ${tableName} (
          id VARCHAR(255) PRIMARY KEY,
          stockCode VARCHAR(255) UNIQUE,
          barcode VARCHAR(255) UNIQUE,
          productName VARCHAR(255),
          brand VARCHAR(255),
          images JSON, 
          description TEXT,
          purPrice VARCHAR(255),
          purCurrency VARCHAR(10),
          price VARCHAR(255),
          saleCurrency VARCHAR(10), 
          stock VARCHAR(25),
          criticStock VARCHAR(25),
          tax VARCHAR(6),
          origin VARCHAR(255),
          relatedFirm VARCHAR(255),
          desi VARCHAR(255),
          dimensions VARCHAR(255),
          tags JSON,
          content TEXT, 
          teminTermin VARCHAR(6), 
          active BOOLEAN, 
          onPremise BOOLEAN,
          vulnerable BOOLEAN, 
          eCommerced BOOLEAN,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          url VARCHAR(255),
          formalPrice VARCHAR(255),
          prices JSON,
          category VARCHAR(255),
          discount VARCHAR(25),
          onSale BOOLEAN, 
          bundle JSON,
          source VARCHAR(255),
          unit VARCHAR(255),
          warranty VARCHAR(25),
          mbf BOOLEAN,
          mbfPeriod VARCHAR(25),
          PBSList JSON
        );
      `;

      // Execute the table creation query
      await db.promise().query(createTableSql);
    }

    // If the table exists or was created successfully, respond with status 200
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating table', error: err.message });
  }
});


const addOrGetBrandId = async (brandTitle, owner) => {
  const normalizedBrandTitle = brandTitle ? brandTitle.trim().toLowerCase() : "";

  return new Promise((resolve, reject) => {
    // Check if the brand already exists
    const checkSql = 'SELECT id FROM brands WHERE LOWER(title) = ? AND owner = ?';
    db.query(checkSql, [normalizedBrandTitle, owner], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        // Brand exists, return the existing ID
        resolve(results[0].id);
      } else {
        function generateShortUUID() {
          const min = 1000000; // Minimum 7-digit number (inclusive)
          const max = 9999999; // Maximum 7-digit number (inclusive)
          const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
          return randomNumber.toString();
        }

        const uniqueId = generateShortUUID();
        const url = convertToSlug(normalizedBrandTitle);
        const createdAt = new Date();
        const insertSql = 'INSERT INTO brands (id, title, parent, app, owner, userid, createdAt, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        db.query(insertSql, [uniqueId, brandTitle.trim(), null, null, owner, null, createdAt, url], (insertErr) => {
          if (insertErr) {
            if (insertErr.code === 'ER_DUP_ENTRY') {
              // Eğer aynı anda başka bir işlem tarafından eklenmişse, tekrar sorgulayın
              db.query(checkSql, [normalizedBrandTitle, owner], (err2, results2) => {
                if (err2) {
                  return reject(err2);
                }
                if (results2.length > 0) {
                  resolve(results2[0].id);
                } else {
                  reject(new Error('Failed to insert and retrieve brand.'));
                }
              });
            } else {
              return reject(insertErr);
            }
          } else {
            resolve(uniqueId); // Return the new brand ID
          }
        });
      }
    });
  });
};

router.post('/upload', upload.single('file'), async (req, res) => {
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Marka önbelleği
  const brandCache = new Map();

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const headerMapping = {
      'Stok Kodu *': 'stockCode',
      'Barkod *': 'barcode',
      'Ürün Adı *': 'productName',
      'Marka': 'brand',  // Assuming there's a "Marka" column
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
      'Garanti Süresi': 'warranty',
      'Takip Edilmeli mi': 'mbf',
      'Birim': 'unit'
    };

    // Önce tüm benzersiz markaları topla
    const uniqueBrands = [
      ...new Set(
        jsonData
          .map(item => item['Marka'])
          .filter(brand => brand && brand.trim().length > 0)
          .map(brand => brand.trim())
      )
    ];

    // Marka ID'lerini al veya ekle ve önbelleğe koy
    for (const brand of uniqueBrands) {
      const brandId = await addOrGetBrandId(brand, firmId);
      brandCache.set(brand.toLowerCase(), brandId);
    }

    const transformedData = jsonData.map(item => {
      const transformedItem = {};
      for (const key in headerMapping) {
        transformedItem[headerMapping[key]] = item[key] || null;
      }

      if (transformedItem.brand) {
        const normalizedBrand = transformedItem.brand.trim().toLowerCase();
        transformedItem.brand = brandCache.get(normalizedBrand) || null;
      }

      return transformedItem;
    });

    const tableName = `products_${firmId}`;

    const promises = transformedData.map(product => {
      const {
        stockCode,
        barcode,
        productName,
        brand,
        //images,
        description,
        price,
        stock,
        criticStock,
        tax,
        purPrice,
        saleCurrency,
        purCurrency,
        origin,
        //relatedFirm,
        warranty,
        //mbf,
        unit
      } = product;

      const sql = `INSERT INTO ${tableName} (
        id, stockCode, barcode, productName, brand, images, description, purPrice, purCurrency, price, saleCurrency, stock, criticStock, tax, origin, relatedFirm, unit, warranty, mbf, createdAt, updatedAt, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        generateShortUUID(),
        stockCode,
        barcode,
        productName,
        brand,
        null,
        description,
        purPrice,
        purCurrency,
        price,
        saleCurrency,
        stock,
        criticStock,
        tax,
        origin,
        null,
        unit,
        warranty,
        false,
        new Date(),
        new Date(),
        true
      ];

      return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });

    await Promise.all(promises);
    res.json({ message: 'Products uploaded successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error processing the file: ' + error.message);
  }
});


// router.post('/upload', upload.single('file'), (req, res) => {
//   // Extract firmId from the query parameters
//   const { firmId } = req.query;

//   if (!firmId) {
//     return res.status(400).send('firmId is required.');
//   }

//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }
  
//   try {
//     // Read the Excel file
//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0]; // Assuming single-sheet files
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(worksheet);

//     const headerMapping = {
//       'Stok Kodu *': 'stockCode',
//       'Barkod *': 'barcode',
//       'Ürün Adı *': 'productName',
//       'Fotoğraflar': 'images',
//       'Açıklama': 'description',
//       'Alış Fiyatı': 'purPrice',
//       'Alış Kuru': 'purCurrency',
//       'Satış Fiyatı *': 'price',
//       'Satış Kuru': 'saleCurrency',
//       'Stok *': 'stock',
//       'Kritik Stok': 'criticStock',
//       'Tax (Rakam ile) *': 'tax',
//       'Menşe': 'origin',
//       'İlgili Firma': 'relatedFirm',
//       'Garanti Süresi': 'warranty',
//       'Takip Edilmeli mi':'mbf',
//       'Birim':"unit"

//     };

//     const transformedData = jsonData.map((item) => {
//       const transformedItem = {};
//       Object.keys(headerMapping).forEach((key) => {
//         transformedItem[headerMapping[key]] = item[key] || null;
//       });
//       return transformedItem;
//     });
//     // Define the table name
//     const tableName = `products_${firmId}`;
//     const id = generateShortUUID();

//     // Loop through the JSON data and insert into the database
//     const promises = transformedData.map((product) => {
//       const {
//         stockCode, barcode, productName,  images, description, 
//         price, stock, criticStock,  tax,
//         purPrice, saleCurrency, purCurrency, origin, relatedFirm,
//         warranty, mbf, unit
//       } = product;

//       const sql = `INSERT INTO ${tableName} (
//         id, 
//         stockCode, 
//         barcode, 
//         productName, 
//         brand,
//         images,
//         description,
//         purPrice,
//         purCurrency,
//         price,
//         saleCurrency,        
//         stock,
//         criticStock,
//         tax,
//         origin,
//         relatedFirm,
//         desi,
//         dimensions,
//         tags,
//         content,
//         teminTermin,
//         active,
//         onPremise,
//         vulnerable,
//         eCommerced,
//         createdAt,
//         updatedAt,
//         url,
//         formalPrice,
//         prices,
//         category,
//         discount,
//         onSale,
//         bundle,
//         source,
//         unit,
//         warranty,
//         mbf,
//         mbfPeriod,
//         PBSList
//       ) VALUES (
//         ?, ?, ?, ?, ?, ?, ?, ?, ?,
//         ?, ?, ?, ?, ?, ?, ?, ?, ?,
//         ?, ?, ?, ?, ?, ?, ?, ?, ?,
//         ?, ?, ?, ?, ?, ?, ?, ?, ?,
//         ?, ?, ?, ?
//       )`;

//       // Convert arrays to strings, handle booleans as well
//       const imagesArray = images ? JSON.stringify(images.split(',')) : null;
//       //const tagsArray = tags ? JSON.stringify(tags.split(',')) : null;
//       //const bundleArray = bundle ? JSON.stringify(bundle.split(',')) : null;


//       const values = [
//         generateShortUUID(),
//         stockCode, 
//         barcode, 
//         productName, 
//         null,
//         imagesArray,
//         description,
//         purPrice,
//         purCurrency,
//         price,
//         saleCurrency,
//         stock,
//         criticStock,
//         tax,
//         origin,
//         relatedFirm,
//         null,
//         null,
//         null,// tags
//         '', // content
//         '', // teminTermin
//         true, // active
//         false, // onPremise
//         false, // vulnerable
//         true, // eCommerced
//         new Date(), // createdAt
//         new Date(), // updatedAt
//         '', // url
//         0, // formalPrice
//         '[]', // prices
//         '', // category
//         0, // discount
//         false, // onSale
//         null, //bundle
//         '', // source
//         unit,//unit
//         warranty,
//         true,
//         null,
//         null
//       ];

//       return new Promise((resolve, reject) => {
//         db.query(sql, values, (err, results) => {
//           if (err) {
//             console.log(err)
//             reject(err);
//           } else {
//             resolve(results);
//           }
//         });
//       });
//     });

//     // Execute all insertions
//     Promise.all(promises)
//       .then(() => res.json({ message: 'Products uploaded successfully' }))
//       .catch((error) => {
//         console.log(error)
//         res.status(500).send(error)});
//   } catch (error) {
//     console.log(error)
//     return res.status(500).send('Error processing the file: ' + error.message);
//   }
// });


// READ all products
router.get('/', (req, res) => {
  const { firmId } = req.query; // Extract 'owner' from the query string

  const sql = `SELECT * FROM products_${firmId} ORDER BY productName ASC`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

router.get('/count', (req, res) => {
  const { firmId } = req.query;

  const tableName = `products_${firmId}`;

  let sql = `SELECT COUNT(*) AS count FROM ${tableName}`;
  let queryParams = [];



  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ count: results[0].count });
  });
});

router.get('/byBrand', (req, res) => {
  const { firmId, brand } = req.query;

  // Ensure firmId is provided
  if (!firmId) {
    return res.status(400).send("firmId is required");
  }

  // Base SQL query
  let sql = `SELECT * FROM products_${firmId}`;

  // Add brand filter if provided
  if (brand) {
    sql += ` WHERE brand = ${db.escape(brand)}`; // Use db.escape to prevent SQL injection
  }

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});
router.get('/byCategory', (req, res) => {
  const { firmId, category } = req.query;

  // Ensure firmId is provided
  if (!firmId) {
    return res.status(400).send("firmId is required");
  }

  // Base SQL query
  let sql = `SELECT * FROM products_${firmId}`;

  // Add category filter if provided
  if (category) {
    sql += ` WHERE category = ${db.escape(category)}`; // Use db.escape to prevent SQL injection
  }

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

router.get('/byGroup', (req, res) => {
  const { firmId, bundle } = req.query;

  // Ensure firmId is provided
  if (!firmId) {
    return res.status(400).send("firmId is required");
  }

  // Base SQL query
  let sql = `SELECT * FROM products_${firmId}`;

  // Add bundle filter if provided
  if (bundle) {
    sql += ` WHERE JSON_CONTAINS(bundle, JSON_QUOTE(${db.escape(bundle)}))`; // Use db.escape to prevent SQL injection
  }

  // Execute the query
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

  const tableName = `products_${firmId}`;

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
  let sql = `UPDATE products_${firmId} SET `;
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
      return res.status(404).send('Product not found');
    }
    res.json({ message: 'Product updated successfully' });
  });
});





router.put('/multiple/:id', async (req, res) => {
  const { id } = req.params;
  const { firmId, multiple } = req.query;
  const updatedFields = req.body;

  if (!firmId) {
    return res.status(400).send('firmId is required');
  }

  if (!Object.keys(updatedFields).length) {
    return res.status(400).send('No fields to update');
  }

  // Fetch current product data if `multiple` flag is true
  let currentData;
  if (multiple === 'true') {
    const [rows] = await db.promise().query(`SELECT * FROM products_${firmId} WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).send('Product not found');
    }
    currentData = rows[0];
  }

  let sql = `UPDATE products_${firmId} SET `;
  const sqlValues = [];
  let fieldsToUpdate = false;

  // Iterate through the updated fields and build the query dynamically
  for (const field in updatedFields) {
    let value = updatedFields[field];

    if (multiple === 'true') {
      // Handle fields with multiple values by merging arrays if `multiple` is true
      if (Array.isArray(value)) {
        const existingValues = JSON.parse(currentData[field] || '[]');
        value = JSON.stringify([...new Set([...existingValues, ...value])]); // Avoid duplicates
      } else if (field === 'price') {
        // Append to `prices` if updating the `price` field
        const existingPrices = JSON.parse(currentData.prices || '[]');
        const newPrices = JSON.stringify([...existingPrices, value]);
        sql += `prices = ?, `;
        sqlValues.push(newPrices);
        fieldsToUpdate = true;
        continue;
      }
    } else {
      // If not in multiple mode, use the value directly without array processing
      value = typeof value === 'string' ? value : JSON.stringify(value);
    }

    // Add field to the query
    sql += `${field} = ?, `;
    sqlValues.push(value);
    fieldsToUpdate = true;
  }

  // Check if we have fields to update, else return an error
  if (!fieldsToUpdate) {
    return res.status(400).send('No valid fields to update');
  }

  // Remove trailing comma and space from the SET clause
  sql = sql.slice(0, -2);

  // Add WHERE clause
  sql += ' WHERE id = ?';
  sqlValues.push(id);


  // Execute the query
  db.query(sql, sqlValues, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }
    res.json({ message: 'Product updated successfully' });
  });
});






// DELETE a product by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  const tableName = `products_${firmId}`;
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }
    res.json({ message: 'Product deleted successfully' });
  });
});


module.exports = router;
