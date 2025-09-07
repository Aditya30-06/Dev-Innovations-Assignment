import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersAPI } from '../services/api';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Plus,
  Search
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLeads: 0,
    totalValue: 0,
    convertedLeads: 0
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers with pagination to get recent ones
      const customersResponse = await customersAPI.getCustomers({ page: 1, limit: 5 });
      const customers = customersResponse.data.data.customers;
      
      setRecentCustomers(customers);
      
      // Calculate stats from customers data
      let totalLeads = 0;
      let totalValue = 0;
      let convertedLeads = 0;
      const statusCounts = { New: 0, Contacted: 0, Converted: 0, Lost: 0 };
      
      // For each customer, fetch their leads to calculate stats
      for (const customer of customers) {
        try {
          const leadsResponse = await customersAPI.getCustomer(customer._id);
          const leads = leadsResponse.data.data.leads;
          
          totalLeads += leads.length;
          
          leads.forEach(lead => {
            const leadValue = lead.value || 0;
            totalValue += leadValue;
            statusCounts[lead.status]++;
            if (lead.status === 'Converted') {
              convertedLeads++;
            }
          });
        } catch (error) {
          console.error(`Error fetching leads for customer ${customer._id}:`, error);
        }
      }
      
      setStats({
        totalCustomers: customers.length,
        totalLeads,
        totalValue,
        convertedLeads
      });
      
      // Prepare chart data
      setLeadStatusData([
        { name: 'New', value: statusCounts.New, color: '#3b82f6' },
        { name: 'Contacted', value: statusCounts.Contacted, color: '#f59e0b' },
        { name: 'Converted', value: statusCounts.Converted, color: '#10b981' },
        { name: 'Lost', value: statusCounts.Lost, color: '#ef4444' }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-content">
        <div className="stat-info">
          <h3>{title}</h3>
          <div className="stat-value">{value}</div>
        </div>
        <div className={`stat-icon stat-icon-${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your CRM.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
        />
        <StatCard
          title="Converted Leads"
          value={stats.convertedLeads}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Customers */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Recent Customers</h3>
            <Link to="/customers" className="card-action">
              <Eye className="h-4 w-4" />
              View All
            </Link>
          </div>
          
          {recentCustomers.length > 0 ? (
            <div className="card-content">
              {recentCustomers.map((customer) => (
                <div key={customer._id} className="recent-customer">
                  <div className="customer-info">
                    <h4 className="customer-name">{customer.name}</h4>
                    <p className="customer-email">{customer.email}</p>
                    {customer.company && (
                      <p className="company">{customer.company}</p>
                    )}
                  </div>
                  <div className="customer-stats">
                    <p className="lead-count">{customer.leadCount || 0} leads</p>
                    <Link
                      to={`/customers/${customer._id}`}
                      className="view-link"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users className="empty-state-icon" />
              <h3>No customers yet</h3>
              <p>Get started by adding your first customer.</p>
              <Link to="/customers" className="quick-action-btn">
                <Plus className="h-4 w-4" />
                Add Customer
              </Link>
            </div>
          )}
        </div>

        {/* Lead Status Chart */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Leads by Status</h3>
          </div>
          
          {stats.totalLeads > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingUp className="empty-state-icon" />
              <h3>No leads data</h3>
              <p>Create some leads to see analytics here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="quick-actions-grid">
          <Link to="/customers" className="quick-action-btn">
            <Users className="h-4 w-4" />
            Manage Customers
          </Link>
          <Link to="/customers" className="quick-action-btn secondary">
            <Search className="h-4 w-4" />
            Search Customers
          </Link>
          <Link to="/customers" className="quick-action-btn success">
            <Plus className="h-4 w-4" />
            Add New Customer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
