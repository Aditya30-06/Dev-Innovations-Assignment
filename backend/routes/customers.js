const express = require('express');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { validate, validateQuery, customerSchema, paginationSchema } = require('../middleware/validation');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private
router.post('/', authenticateToken, validate(customerSchema), async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      ownerId: req.user._id
    };

    const customer = new Customer(customerData);
    await customer.save();

    // Populate owner details
    await customer.populate('ownerId', 'name email');

    res.status(201).json({
      success: true,
      data: { customer },
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// @route   GET /api/customers
// @desc    Get all customers with pagination and search
// @access  Private
router.get('/', authenticateToken, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page, limit, q } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // If user is not admin, only show their customers
    if (req.user.role !== 'admin') {
      query.ownerId = req.user._id;
    }

    // Add search functionality
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } }
      ];
    }

    // Get customers with pagination
    const customers = await Customer.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Customer.countDocuments(query);

    // Get lead counts for each customer
    const customersWithLeadCounts = await Promise.all(
      customers.map(async (customer) => {
        const leadCount = await Lead.countDocuments({ customerId: customer._id });
        return {
          ...customer.toObject(),
          leadCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        customers: customersWithLeadCounts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get customer by ID with leads
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('ownerId', 'name email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && customer.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get customer's leads
    const leads = await Lead.find({ customerId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        customer,
        leads
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', authenticateToken, validate(customerSchema), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && customer.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email');

    res.json({
      success: true,
      data: { customer: updatedCustomer },
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer and all associated leads
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && customer.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete all leads associated with this customer
    await Lead.deleteMany({ customerId: req.params.id });

    // Delete the customer
    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Customer and associated leads deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

module.exports = router;
