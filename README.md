# Mini CRM Application

A full-stack Customer Relationship Management (CRM) application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### Backend Features
- **Authentication & Authorization**
  - User registration and login with JWT
  - Password hashing with bcrypt
  - Role-based access control (Admin/User)
  - Protected routes middleware

- **Customer Management**
  - CRUD operations for customers
  - Pagination and search functionality
  - Owner-based access control
  - Data validation with Joi

- **Lead Management**
  - CRUD operations for leads under customers
  - Lead status tracking (New, Contacted, Converted, Lost)
  - Lead value tracking
  - Status-based filtering

- **Additional Features**
  - Input validation and error handling
  - Rate limiting and security headers
  - Comprehensive API documentation
  - Unit tests for authentication

### Frontend Features
- **Authentication**
  - User registration and login pages
  - JWT token management
  - Protected routes
  - User profile management

- **Dashboard**
  - Overview statistics
  - Recent customers display
  - Lead status charts
  - Quick action buttons

- **Customer Management**
  - Customer listing with pagination
  - Search functionality
  - Add/Edit/Delete customers
  - Customer detail view

- **Lead Management**
  - Lead creation and editing
  - Status filtering
  - Value tracking
  - Lead analytics

- **UI/UX**
  - Responsive design (mobile + desktop)
  - Modern, clean interface
  - Toast notifications
  - Loading states
  - Form validation

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation
- **Jest** - Testing framework
- **Supertest** - HTTP testing

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📁 Project Structure

```
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   └── Lead.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   └── leads.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── tests/
│   │   └── auth.test.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── CustomerModal.js
│   │   │   └── LeadModal.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Customers.js
│   │   │   └── CustomerDetail.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🗄 Database Schema

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String (required, max: 50),
  email: String (required, unique, lowercase),
  passwordHash: String (required, min: 6),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Customers
```javascript
{
  _id: ObjectId,
  name: String (required, max: 100),
  email: String (required, unique, lowercase),
  phone: String (max: 20),
  company: String (max: 100),
  ownerId: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Leads
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'Customer', required),
  title: String (required, max: 200),
  description: String (max: 1000),
  status: String (enum: ['New', 'Contacted', 'Converted', 'Lost'], default: 'New'),
  value: Number (min: 0, default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Schema Diagram
```
Users (1) ──────── (N) Customers
                    │
                    │ (1)
                    │
                    ▼
                  Leads
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/crm_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/crm_db`

#### Option 2: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your `.env` file

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### POST /api/auth/login
Authenticate user
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### GET /api/auth/me
Get current user profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Customer Endpoints

#### GET /api/customers
Get all customers with pagination and search
```bash
curl -X GET "http://localhost:5000/api/customers?page=1&limit=10&q=search_term" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### POST /api/customers
Create a new customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "company": "Acme Corporation"
  }'
```

#### GET /api/customers/:id
Get customer details with leads
```bash
curl -X GET http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PUT /api/customers/:id
Update customer
```bash
curl -X PUT http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

#### DELETE /api/customers/:id
Delete customer
```bash
curl -X DELETE http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Lead Endpoints

#### GET /api/customers/:customerId/leads
Get leads for a customer
```bash
curl -X GET "http://localhost:5000/api/customers/CUSTOMER_ID/leads?status=New&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### POST /api/customers/:customerId/leads
Create a new lead
```bash
curl -X POST http://localhost:5000/api/customers/CUSTOMER_ID/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Lead",
    "description": "Lead description",
    "status": "New",
    "value": 1000
  }'
```

#### PUT /api/customers/:customerId/leads/:leadId
Update a lead
```bash
curl -X PUT http://localhost:5000/api/customers/CUSTOMER_ID/leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "Converted",
    "value": 1500
  }'
```

#### DELETE /api/customers/:customerId/leads/:leadId
Delete a lead
```bash
curl -X DELETE http://localhost:5000/api/customers/CUSTOMER_ID/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

The test suite includes:
- User registration validation
- User login functionality
- JWT token verification
- Error handling

### Frontend Testing
```bash
cd frontend
npm test
```

## 🎯 Usage Guide

### Getting Started
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Register a new account or login
4. Start adding customers and leads

### Key Features Usage

#### Customer Management
- **Add Customer**: Click "Add Customer" button, fill in details
- **Search**: Use the search bar to find customers by name, email, or company
- **Edit**: Click the edit icon next to any customer
- **Delete**: Click the delete icon (requires confirmation)

#### Lead Management
- **View Leads**: Click on a customer to see their leads
- **Add Lead**: Click "Add Lead" button in customer detail view
- **Filter Leads**: Use the status dropdown to filter leads
- **Update Status**: Edit leads to change their status and value

#### Dashboard
- **Overview**: View key statistics and recent activity
- **Charts**: See lead distribution by status
- **Quick Actions**: Access common tasks quickly

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation with Joi
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **Role-based Access**: Admin and user role permissions

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Ensure MongoDB connection is configured
3. Deploy to platforms like:
   - Heroku
   - Render
   - DigitalOcean
   - AWS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection Error**: Check your MONGO_URI in .env
- **JWT Secret Error**: Ensure JWT_SECRET is set in .env
- **Port Already in Use**: Change PORT in .env or kill existing process

#### Frontend Issues
- **API Connection Error**: Check if backend is running on correct port
- **Build Errors**: Clear node_modules and reinstall dependencies
- **Routing Issues**: Ensure you're using the correct base URL

### Getting Help
- Check the console for error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Check MongoDB connection

## 📊 Performance Considerations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: Implemented for large datasets
- **Caching**: Consider implementing Redis for session storage
- **Image Optimization**: For future file upload features
- **CDN**: For static assets in production

## 🔮 Future Enhancements

- **File Uploads**: Customer documents and lead attachments
- **Email Integration**: Automated email notifications
- **Advanced Analytics**: More detailed reporting and charts
- **Mobile App**: React Native version
- **Real-time Updates**: WebSocket integration
- **Advanced Search**: Full-text search with Elasticsearch
- **API Rate Limiting**: Per-user rate limiting
- **Audit Logs**: Track all changes and user actions

---

**Built with ❤️ using the MERN stack**
