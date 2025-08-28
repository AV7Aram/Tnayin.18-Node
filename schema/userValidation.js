const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  repeat_password: Joi.ref('password'),
  age: Joi.number().integer().min(0).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  age: Joi.number().integer().min(0).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),       
  new_password: Joi.string().min(6).optional()    
}).or('name', 'age', 'email', 'password', 'new_password');


module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema
};
