const express = require('express');
const { userReader } = require('../middleware/userReader');
const AuthController = require('../controllers/AuthController');

const authRouter = express.Router();
const authController = new AuthController();

authRouter.get('/register', authController.getRegister);
authRouter.post('/register', userReader, authController.postRegister.bind(authController));

authRouter.get('/login', authController.getLogin);
authRouter.post('/login', userReader, authController.postLogin.bind(authController));

module.exports = { authRouter };
