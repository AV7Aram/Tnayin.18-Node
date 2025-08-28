const express = require('express');
const { userReader } = require('../middleware/userReader');
const router = express.Router();

router.get('/', userReader, (req, res) => {
  res.render('index', {
    users: req.users,
    message: null
  });
});

module.exports = router;