const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
  role: Joi.string().valid('user', 'admin').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// Customer validation schemas
const customerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Customer name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().trim().max(20).allow('')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  company: Joi.string().trim().max(100).allow('')
    .messages({
      'string.max': 'Company name cannot exceed 100 characters'
    })
});

// Lead validation schemas
const leadSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required()
    .messages({
      'string.empty': 'Lead title is required',
      'string.min': 'Title must be at least 2 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string().trim().max(1000).allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').default('New'),
  value: Joi.number().min(0).default(0)
    .messages({
      'number.min': 'Value cannot be negative'
    })
});

// Query validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().trim().max(100).allow('')
});

const leadFilterSchema = Joi.object({
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  registerSchema,
  loginSchema,
  customerSchema,
  leadSchema,
  paginationSchema,
  leadFilterSchema
};
