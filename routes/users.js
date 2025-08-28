const express = require('express');
const bcrypt = require('bcryptjs');
const { userReader } = require('../middleware/userReader');
const { writeUsers } = require('../helpers/userWriter');
const { registerSchema, loginSchema } = require('../schema/userValidation');

const usersRouter = express.Router();

// GET Registration page
usersRouter.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST Registration
usersRouter.post('/register', userReader, async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).render('register', { error: error.message });

  const { name, email, password, age } = value;
  if (req.users.find(u => u.email === email)) {
    return res.status(400).render('register', { error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  req.users.push({ id: Date.now(), name, email, password: hashedPassword, age });
  writeUsers(req.users);

  res.render('register', { error: null });
});

// GET Login page
usersRouter.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST Login
usersRouter.post('/login', userReader, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).render('login', { error: error.message });

  const { email, password } = value;
  const user = req.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).render('login', { error: 'Invalid credentials' });
  }

  res.render('login', { error: null, message: `Welcome ${user.name}!` });
});

// GET users list (JSON)
usersRouter.get('/users', userReader, (req, res) => {
  const { name, age } = req.query;
  let users = req.users
  if (name) {
    users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
    if (users.length === 0) {
      return res.json({ message: 'No user with that name was found.' });
    }
  }

  if (age === 'min') {
    users.sort((a, b) => a.age - b.age);
  } else if (age === 'max') {
    users.sort((a, b) => b.age - a.age);
  }

  res.json(users)
});

// PUT update user
usersRouter.put('/users/:id', userReader, (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  const users = req.users

  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex].name = name || users[userIndex].name;
  users[userIndex].age = parseInt(age) || users[userIndex].age;

  writeUsers(users);
  res.json({ message: 'User updated successfully' });
});

// DELETE user
usersRouter.delete('/users/:id', userReader, (req, res) => {
  const { id } = req.params;
  let users = req.users
  const initialLength = users.length;

  users = users.filter(u => u.id != id);

  if (users.length === initialLength) {
    return res.status(404).json({ error: 'User not found' });
  }

  writeUsers(users);
  res.json({ message: 'User deleted successfully' });
});

module.exports = { usersRouter };
