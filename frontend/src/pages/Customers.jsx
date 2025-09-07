import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { customersAPI } from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomerModal from "../components/CustomerModal";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // ✅ Declare fetchCustomers before useEffect
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        q: searchTerm,
      };

      const response = await customersAPI.getCustomers(params);
      const { customers, pagination: paginationData } = response.data.data;

      setCustomers(customers);
      setPagination(paginationData);
      setTotalPages(paginationData.totalPages);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // ✅ useEffect now safely calls fetchCustomers
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (customerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this customer? This will also delete all associated leads."
      )
    ) {
      try {
        await customersAPI.deleteCustomer(customerId);
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleModalSuccess = () => {
    fetchCustomers();
    handleModalClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && customers.length === 0) {
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

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title">Customers</h1>
              <p className="page-subtitle">
                Manage your customer relationships
              </p>
              <br />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or company..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div
              className="text-sm text-gray-500 flex items-center"
              style={{ marginTop: "10px" }}
            >
              {pagination.totalCustomers || 0} customers found
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="table-container">
          {customers.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Leads</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer._id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" /> &nbsp;
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" /> &nbsp;
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {customer.company ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-3 w-3 mr-1" /> &nbsp;
                          {customer.company}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.leadCount || 0} leads
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/customers/${customer._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          &nbsp;
                        </Link>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" /> &nbsp;
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" /> &nbsp;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">

                <Users className="h-12 w-12 text-gray-400 mx-auto mb-5" />{" "}
                &nbsp;
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No customers found" : "No customers yet"}
                </h3>
                <p className="text-gray-500 mb-5 mt-5">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Get started by adding your first customer."}
                </p>
                <br />
                {!searchTerm && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn ${
                      currentPage === page ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}

        {/* Customer Modal */}
        {showModal && (
          <CustomerModal
            customer={editingCustomer}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Customers;
