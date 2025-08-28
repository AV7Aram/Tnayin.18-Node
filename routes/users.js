const express = require('express');
const bcrypt = require('bcryptjs');
const { userReader } = require('../middleware/userReader');
const { writeUsers } = require('../helpers/userWriter');
const { registerSchema, loginSchema, updateUserSchema } = require('../schema/userValidation');

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

  req.session = req.session || {};
  req.session.loginMessage = `Login successful! Welcome, ${user.name}.`;
  return res.redirect('/');
});

// GET users list (JSON)
usersRouter.get('/users', userReader, (req, res) => {
  const { name, age } = req.query;
  let users = req.users
  let filteredUsers = [...users];
  let messages = [];

  if (name) {
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(name.toLowerCase())
    );

    if (filteredUsers.length === 0) {
      messages.push('No user with that name was found.');
    }
  }

  if (age) {
    if (age === 'min') {
      filteredUsers.sort((a, b) => a.age - b.age);
    } else if (age === 'max') {
      filteredUsers.sort((a, b) => b.age - a.age);
    } else {
      messages.push('Invalid sort value. Use "min" or "max".');
    }
  }

  if (messages.length > 0) {
    return res.status(400).json({ messages });
  }

  res.json(filteredUsers);
});

// PUT update user
usersRouter.put('/users/:id', userReader, async (req, res) => {
  const { id } = req.params;
  const users = req.users;

  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = users[userIndex];
  const { name, age, email, password, new_password } = value;
  const updatedFields = [];

  if (name) {
    user.name = name;
    updatedFields.push('name');
  }

  if (typeof age !== 'undefined') {
    user.age = age;
    updatedFields.push('age');
  }

  if (email) {
    const emailExists = users.some((u, i) => u.email === email && i !== userIndex);
    if (emailExists) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    user.email = email;
    updatedFields.push('email');
  }

  if (password || new_password) {
    if (!password || !new_password) {
      return res.status(400).json({ error: 'Both password and new_password must be provided' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    user.password = hashed;
    updatedFields.push('password');
  }

  if (updatedFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  writeUsers(users);

  res.json({
    message: 'User updated successfully',
    updated: updatedFields
  });
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
