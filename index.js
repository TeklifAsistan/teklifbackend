// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');

// Import Routes
const indexRoutes = require('./routes/index');
const firmsRoutes = require('./routes/firms');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const logsRoutes = require('./routes/logs');
const brandRoutes = require('./routes/brands');
const product_groupsRoutes = require('./routes/product_groups');
const personelRoutes = require('./routes/personel');
const offerRoutes = require('./routes/offer');
const tagRoutes = require('./routes/tags');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 4747;

// Middleware
app.use(bodyParser.json());

// Routes
app.use(cors())

app.use('/', indexRoutes);
app.use('/firms', firmsRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/logs', logsRoutes); // If you have a dedicated logs route
app.use('/brands', brandRoutes); // If you have a dedicated logs route
app.use('/product_groups', product_groupsRoutes); // If you have a dedicated logs route
app.use('/personel', personelRoutes); // If you have a dedicated logs route
app.use('/offers', offerRoutes); // If you have a dedicated logs route
app.use('/tags', tagRoutes); // If you have a dedicated logs route
app.use('/notes', noteRoutes); // If you have a dedicated logs route



// Start server
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
