const express = require('express');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { validate, validateQuery, leadSchema, leadFilterSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/customers/:customerId/leads
// @desc    Create a new lead for a customer
// @access  Private
router.post('/:customerId/leads', authenticateToken, validate(leadSchema), async (req, res) => {
  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.params.customerId);
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

    const leadData = {
      ...req.body,
      customerId: req.params.customerId
    };

    const lead = new Lead(leadData);
    await lead.save();

    // Populate customer details
    await lead.populate('customerId', 'name email company');

    res.status(201).json({
      success: true,
      data: { lead },
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error('Create lead error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create lead'
    });
  }
});

// @route   GET /api/customers/:customerId/leads
// @desc    Get all leads for a customer with filtering
// @access  Private
router.get('/:customerId/leads', authenticateToken, validateQuery(leadFilterSchema), async (req, res) => {
  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.params.customerId);
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

    const { page, limit, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { customerId: req.params.customerId };
    if (status) {
      query.status = status;
    }

    // Get leads with pagination
    const leads = await Lead.find(query)
      .populate('customerId', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalLeads: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

// @route   GET /api/customers/:customerId/leads/:leadId
// @desc    Get a specific lead
// @access  Private
router.get('/:customerId/leads/:leadId', authenticateToken, async (req, res) => {
  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.params.customerId);
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

    const lead = await Lead.findOne({
      _id: req.params.leadId,
      customerId: req.params.customerId
    }).populate('customerId', 'name email company');

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead or customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
});

// @route   PUT /api/customers/:customerId/leads/:leadId
// @desc    Update a lead
// @access  Private
router.put('/:customerId/leads/:leadId', authenticateToken, validate(leadSchema), async (req, res) => {
  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.params.customerId);
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

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.leadId, customerId: req.params.customerId },
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email company');

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead },
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Update lead error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead or customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update lead'
    });
  }
});

// @route   DELETE /api/customers/:customerId/leads/:leadId
// @desc    Delete a lead
// @access  Private
router.delete('/:customerId/leads/:leadId', authenticateToken, async (req, res) => {
  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.params.customerId);
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

    const lead = await Lead.findOneAndDelete({
      _id: req.params.leadId,
      customerId: req.params.customerId
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead or customer ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete lead'
    });
  }
});

module.exports = router;
