// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const { version } = require('xlsx');


// CREATE a new offer
router.post('/', (req, res) => {
  const {
    id,
    title,
    url,
    images,
    subject,
    content,
    type,
    category,
    relatedFromUs,
    relatedFirm,
    relatedFromThem,
    statue,
    sgt,
    publishedAt,
    vPeriod,
    vPeriodType,
    firmId,
    dataOwner,
    sectionList,
    active,
    isOpportunity,
    ourFirmLogo,
    firmLogo,
    currency,
    generalDiscountType1,
    generalDiscount1,
    generalDiscountType2,
    generalDiscount2,
    currencyData,
    EUR,
    GBP,
    USD,
    userid,
    grandTotal,
    grandKDV,
    grandTotalWithoutKDV,
    noteList,
    tags

    

  } = req.body;


  const sql = `
    INSERT INTO offers (
        id,
        title,
        url,
        images,
        subject,
        content,
        type,
        category,
        relatedFromUs,
        relatedFirm,
        relatedFromThem,
        statue,
        sgt,
        publishedAt,
        vPeriod,
        vPeriodType,
        firmId,
        dataOwner,
        sectionList,
        active,
        isOpportunity,
        ourFirmLogo,
        firmLogo,
        currency,
        generalDiscountType1,
        generalDiscount1,
        generalDiscountType2,
        generalDiscount2,
        currencyData,
        EUR,
        GBP,
        USD,
        userid,
        grandTotal,
        grandKDV,
        grandTotalWithoutKDV,
        noteList,
        tags,
        revize,
        version,
        createdAt,
        updatedAt,
        logs,
        versionList
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?
      )`;
      const imagesArray = images ? JSON.stringify(images.split(',')) : null;
      const relatedFromUsArray = relatedFromUs ? JSON.stringify(relatedFromUs) : null;
      const tagsArray = tags ? JSON.stringify(tags) : null;
      //const relatedFromThemArray = relatedFromThem ? JSON.stringify(relatedFromThem) : null;
      const sectionListArray = sectionList ? JSON.stringify(sectionList) : null;
      const noteListArray = noteList ? JSON.stringify(noteList) : null;
      const currencyDataStringified = currencyData ? JSON.stringify(currencyData||{EUR:"",GBP:"",USD:""}) : null;
      
      const values = [
        id,
        title,
        url,
        imagesArray,
        subject,
        content,
        type,
        category,
        relatedFromUsArray,
        relatedFirm,
        relatedFromThem,
        statue || "0",
        sgt,
        publishedAt || new Date(),
        vPeriod,
        vPeriodType,
        firmId,
        dataOwner,
        sectionListArray,
        active || true,
        isOpportunity || false,
        ourFirmLogo,
        firmLogo,
        currency,
        generalDiscountType1,
        generalDiscount1,
        generalDiscountType2,
        generalDiscount2,
        currencyDataStringified,
        EUR,
        GBP,
        USD,
        userid,
        grandTotal,
        grandKDV,
        grandTotalWithoutKDV,
        noteListArray,
        tagsArray,
        1,
        1,
        new Date(), // createdAt
        new Date(), // updatedAt
        null,
        null
      ];

  db.query(sql, values, (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Aynı teklif zaten mevcut.' }); // Duplicate barcode error message
      }
      
      console.log(err)

      return res.status(500).send(err);
    }
    res.json({ message: 'Offer added successfully', id });
  });
});




// READ all offers
// router.get('/', (req, res) => {
//   const { firmId } = req.query; // Extract 'firmId' from the query string

//   if (!firmId) {
//     console.error("Error: firmId is required");
//     return res.status(400).send('firmId is required');
//   }

//   const sql = `SELECT * FROM offers WHERE dataOwner = ? AND id NOT LIKE '%V%' ORDER BY publishedAt DESC`;
  
//   db.query(sql, [firmId], (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).send(err);
//     }
//     res.json(results);
//   });
// });
// Assuming you're using Express.js and have already set up your router and database connection

router.get('/', (req, res) => {
  const { firmId } = req.query; // Extract 'firmId' from the query string

  if (!firmId) {
    console.error("Error: firmId is required");
    return res.status(400).send('firmId is required');
  }

  // Updated SQL query with JOIN to include firmName
  const sql = `
    SELECT 
      offers.*, 
      firms.firmName 
    FROM 
      offers 
    INNER JOIN 
      firms 
    ON 
      offers.relatedFirm = firms.id 
    WHERE 
      offers.dataOwner = ? 
      AND offers.id NOT LIKE '%V%' 
    ORDER BY 
      offers.publishedAt DESC
  `;

  db.query(sql, [firmId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

router.get('/count', (req, res) => {
  const { firmId } = req.query;

  let sql = 'SELECT COUNT(*) AS count FROM offers';
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

  const tableName = `offers`;

  const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Offer not found');
    }
    res.json(results[0]);
  });
});

router.get('/statue/:id', (req, res) => {
  const { id } = req.params;
  
  const tableName = `offers`;
  
  const sql = `SELECT statue FROM ${tableName} WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Statue not found');
    }
    res.json(results[0]);
  });
});

// UPDATE a offer by ID
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

  // Add updatedAt and log fields
  updatedFields.updatedAt = new Date();
  updatedFields.logs = JSON.stringify(updatedFields);

  // Prepare dynamic SQL query
  let sql = `UPDATE offers SET `;
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



router.put('/revize/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;
  const updatedFields = req.body;
  const rootId = id.substring(0, 7);
  console.log("rootId",rootId)

  console.log("Received request to update offer:", { id, firmId, updatedFields });

  if (!firmId) {
    console.error("Error: firmId is required");
    return res.status(400).send('firmId is required');
  }

  if (!Object.keys(updatedFields).length) {
    console.error("Error: No fields to update");
    return res.status(400).send('No fields to update');
  }

  // Step 1: Fetch rootOffer to get revize and version for newId generation
  const rootSelectSql = `SELECT * FROM offers WHERE id = ?`;
  db.query(rootSelectSql, [rootId, firmId], (err, rootResults) => {
    if (err) {
      console.error("Database error on root offer select:", err);
      return res.status(500).send(err);
    }
    if (rootResults.length === 0) {
      console.warn("No root offer found with the given root ID and firmId");
      return res.status(404).send('Root offer not found');
    }

    const rootOffer = rootResults[0];
    const { version, revize, versionList } = rootOffer;

    // Step 2: Fetch oldOffer to use as the base for newOffer
    const selectSql = `SELECT * FROM offers WHERE id = ?`;
    db.query(selectSql, [id, firmId], (err, results) => {
      if (err) {
        console.error("Database error on old offer select:", err);
        return res.status(500).send(err);
      }
      if (results.length === 0) {
        console.warn("No offer found with the given ID and firmId");
        return res.status(404).send('Offer not found');
      }

      const oldOffer = results[0];
      const newId = `${rootId}V${version}R${revize + 1}`;
      const newOffer = { 
        ...oldOffer, 
        ...updatedFields, 
        id: newId, 
        revize: revize + 1,
        version:version,
        updatedAt: new Date(), 
        logs: JSON.stringify(updatedFields)
      };

      // Step 3: Insert newOffer as the new revision
      const insertSql = `INSERT INTO offers SET ?`;
      db.query(insertSql, newOffer, (insertErr) => {
        if (insertErr) {
          console.error("Database error on insert new offer:", insertErr);
          return res.status(500).send(insertErr);
        }

        // Step 4: Update revize in rootOffer
        const updateRootSql = `UPDATE offers SET revize = revize + 1, versionList = ?, updatedAt = ? WHERE id = ?`;
        db.query(updateRootSql, [JSON.stringify([`V${version}R${revize+1}`,...JSON.parse(versionList?versionList:"[]")]), new Date(), rootId], (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Database error on root offer revize update:", updateErr);
            return res.status(500).send(updateErr);
          }
          if (updateResults.affectedRows === 0) {
            console.warn("No root offer found for revize update");
            return res.status(404).send('Root offer not found');
          }

          console.log("New offer created and root offer revize incremented successfully");
          res.json({ newId:newId, message: 'New offer created and root offer revize incremented successfully' });
        });
      });
    });
  });
});
router.put('/version/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;
  const updatedFields = req.body;
  const rootId = id.substring(0, 7);

  console.log("Received request to update offer:", { id, firmId, updatedFields });

  if (!firmId) {
    console.error("Error: firmId is required");
    return res.status(400).send('firmId is required');
  }

  if (!Object.keys(updatedFields).length) {
    console.error("Error: No fields to update");
    return res.status(400).send('No fields to update');
  }

  // Step 1: Fetch rootOffer to get revize and version for newId generation
  const rootSelectSql = `SELECT * FROM offers WHERE id = ?`;
  db.query(rootSelectSql, [rootId, firmId], (err, rootResults) => {
    if (err) {
      console.error("Database error on root offer select:", err);
      return res.status(500).send(err);
    }
    if (rootResults.length === 0) {
      console.warn("No root offer found with the given root ID and firmId");
      return res.status(404).send('Root offer not found');
    }

    const rootOffer = rootResults[0];
    const { version, revize, versionList } = rootOffer;

    // Step 2: Fetch oldOffer to use as the base for newOffer
    const selectSql = `SELECT * FROM offers WHERE id = ?`;
    db.query(selectSql, [id, firmId], (err, results) => {
      if (err) {
        console.error("Database error on old offer select:", err);
        return res.status(500).send(err);
      }
      if (results.length === 0) {
        console.warn("No offer found with the given ID and firmId");
        return res.status(404).send('Offer not found');
      }

      const oldOffer = results[0];
      const newId = `${rootId}V${version+1}R1`;
      const newOffer = { 
        ...oldOffer, 
        ...updatedFields, 
        id: newId, 
        version: version + 1,
        revize:1,
        updatedAt: new Date(), 
        logs: JSON.stringify(updatedFields) 
      };

      // Step 3: Insert newOffer as the new revision
      const insertSql = `INSERT INTO offers SET ?`;
      db.query(insertSql, newOffer, (insertErr) => {
        if (insertErr) {
          console.error("Database error on insert new offer:", insertErr);
          return res.status(500).send(insertErr);
        }

        // Step 4: Update revize in rootOffer
        const updateRootSql = `UPDATE offers SET revize = 1, version = version + 1, versionList = ?, updatedAt = ? WHERE id = ?`;
        db.query(updateRootSql, [JSON.stringify([`V${version+1}R1`,...JSON.parse(versionList?versionList:"[]")]),
        new Date(), rootId], (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Database error on root offer revize update:", updateErr);
            return res.status(500).send(updateErr);
          }
          if (updateResults.affectedRows === 0) {
            console.warn("No root offer found for revize update");
            return res.status(404).send('Root offer not found');
          }

          console.log("New offer created and root offer revize incremented successfully");
          res.json({ newId:newId, message: 'New offer created and root offer revize incremented successfully' });
        });
      });
    });
  });
});








// DELETE a offer by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { firmId } = req.query;

  if (!firmId) {
    return res.status(400).send('firmId is required.');
  }

  const tableName = `offers`;
  const sql = `DELETE FROM ${tableName} WHERE id LIKE ?`; // Use LIKE with wildcard
  const idPattern = `${id}%`; // Match any id that starts with the specified prefix

  db.query(sql, [idPattern], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('No offers found with the specified prefix');
    }
    res.json({ message: 'Offers deleted successfully', deletedCount: results.affectedRows });
  });
});



module.exports = router;


// 8399784V1