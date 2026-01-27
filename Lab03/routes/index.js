const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
  // Redirect to products page instead of showing welcome page
  res.redirect('/products');
});

module.exports = router;
