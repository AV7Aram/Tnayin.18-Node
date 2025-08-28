const express = require('express');
const { userReader } = require('../middleware/userReader');
const UsersController = require('../controllers/UserController');

const usersRouter = express.Router();
const usersController = new UsersController()

usersRouter.get('/users', userReader, usersController.getUsers);
usersRouter.put('/users/:id', userReader, usersController.updateUser.bind(usersController));
usersRouter.delete('/users/:id', userReader, usersController.deleteUser.bind(usersController));

module.exports = { usersRouter };
