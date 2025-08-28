const express = require('express');
const { userReader } = require('../middleware/userReader');
const router = express.Router();

router.get('/', userReader, (req, res) => {
  // stanumenq haxordagrutyuny sessiayic ete ka
  const message = req.session && req.session.loginMessage ? req.session.loginMessage : null;
  if (req.session) req.session.loginMessage = null; // jnjumenq cuyc taluc heto

  res.render('index', {
    users: req.users,
    message
  });
});

module.exports = router;