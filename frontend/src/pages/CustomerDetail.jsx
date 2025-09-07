import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { customersAPI, leadsAPI } from "../services/api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import LeadModal from "../components/LeadModal";

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // --- Define fetch functions first ---
  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getCustomer(id);
      setCustomer(response.data.data.customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLeads = useCallback(async () => {
    try {
      setLeadsLoading(true);
      const params = { page: currentPage, limit: 10, status: statusFilter };
      const response = await leadsAPI.getLeads(id, params);
      const { leads, pagination: paginationData } = response.data.data;
      setLeads(leads);
      setPagination(paginationData);
      setTotalPages(paginationData.totalPages);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLeadsLoading(false);
    }
  }, [id, currentPage, statusFilter]);

  // --- Now useEffect can safely call them ---
  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    if (customer) {
      fetchLeads();
    }
  }, [customer, fetchLeads]);

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadsAPI.deleteLead(id, leadId);
        toast.success("Lead deleted successfully");
        fetchLeads();
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast.error("Failed to delete lead");
      }
    }
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowLeadModal(true);
  };

  const handleModalClose = () => {
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const handleModalSuccess = () => {
    fetchLeads();
    handleModalClose();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "New":
        return "status-new";
      case "Contacted":
        return "status-contacted";
      case "Converted":
        return "status-converted";
      case "Lost":
        return "status-lost";
      default:
        return "status-new";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="main-content">
        <div className="page-container text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Customer not found
          </h2>
          <Link to="/customers" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-container">
        {/* Header */}
        <div className="page-header flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/customers" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="page-title">{customer.name}</h1>
              <p className="page-subtitle">
                Customer Details & Leads Management
              </p>
              <br />
            </div>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>

        {/* Customer Info */}
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Customer Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">
                    Email -{" "}
                  </span>
                  <span className="text-gray-900 font-semibold truncate">
                    {customer.email}
                  </span>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center space-x-3">
                  <br />
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone - </span>
                    <span className="text-gray-900">{customer.phone}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {customer.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Company - </span>
                    <span className="text-gray-900">{customer.company}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <br />
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Created - </span>
                  <span  className="text-gray-900">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Section */}
        <div className="card">
          <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="card-title">Leads ({pagination.totalLeads || 0})</h3>
            <div className="mt-4 sm:mt-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {leadsLoading ? (
            <div className="loading py-8">
              <div className="spinner"></div>
            </div>
          ) : leads.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.title}
                          </div>
                          {lead.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {lead.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center text-gray-900">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(lead.value || 0)}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-500">
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter
                  ? "No leads found with this status"
                  : "No leads yet"}
              </h3>
              
              <p className="text-gray-500 mb-5 mt-5">
                {statusFilter
                  ? "Try selecting a different status filter."
                  : "Get started by adding your first lead for this customer."}
              </p>
              <br />
              {!statusFilter && (
                <button
                  onClick={() => setShowLeadModal(true)}
                  className="btn btn-primary mt-5"
                >
                  <Plus className="h-4 w-4" /> Add Lead
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lead Modal */}
        {showLeadModal && (
          <LeadModal
            customerId={id}
            lead={editingLead}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
