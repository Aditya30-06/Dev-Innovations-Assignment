import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../services/api';
import { X, FileText, DollarSign, Tag, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadModal = ({ customerId, lead, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
    value: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || '',
        description: lead.description || '',
        status: lead.status || 'New',
        value: lead.value || ''
      });
    }
  }, [lead]);

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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Value must be a valid number';
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
      const submitData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : 0
      };
      
      if (lead) {
        // Update existing lead
        await leadsAPI.updateLead(customerId, lead._id, submitData);
        toast.success('Lead updated successfully');
      } else {
        // Create new lead
        await leadsAPI.createLead(customerId, submitData);
        toast.success('Lead created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving lead:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save lead';
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

  const statusOptions = [
    { value: 'New', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'Contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
    { value: 'Lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="modal-title">
              {lead ? 'Edit Lead' : 'Add New Lead'}
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
                <label htmlFor="title" className="form-label">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Lead Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter lead title"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <div className="error">{errors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="form-input"
                  placeholder="Enter lead description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="value" className="form-label">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Value ($)
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.value ? 'border-red-500' : ''}`}
                  placeholder="Enter lead value"
                  value={formData.value}
                  onChange={handleChange}
                />
                {errors.value && <div className="error">{errors.value}</div>}
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
                  {lead ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                lead ? 'Update Lead' : 'Create Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
