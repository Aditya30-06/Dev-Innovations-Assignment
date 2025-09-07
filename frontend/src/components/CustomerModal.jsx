import React, { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { X, User, Mail, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerModal = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (customer) {
        // Update existing customer
        await customersAPI.updateCustomer(customer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        // Create new customer
        await customersAPI.createCustomer(formData);
        toast.success('Customer created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save customer';
      toast.error(errorMessage);
      
      // Handle validation errors from server
      if (error.response?.data?.details) {
        const serverErrors = {};
        error.response.data.details.forEach(detail => {
          serverErrors[detail.field] = detail.message;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="modal-title">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter customer's full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter customer's email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="Enter customer's phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company" className="form-label">
                  <Building className="h-4 w-4 inline mr-2" />
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-input"
                  placeholder="Enter customer's company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  {customer ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                customer ? 'Update Customer' : 'Create Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
