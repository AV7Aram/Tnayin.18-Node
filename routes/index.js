const express = require('express');
const { userReader } = require('../middleware/userReader');
const IndexController = require('../controllers/IndexController');

const router = express.Router();
const indexController = new IndexController()

router.get('/', userReader, indexController.getHome);

module.exports = router;
