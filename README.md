# Multi-Tenant SaaS Notes Application

A secure multi-tenant SaaS notes application built with Next.js, MongoDB, and Mongoose. This application allows multiple tenants (companies) to securely manage their users and notes while enforcing role-based access and subscription limits.

## Features

### Multi-Tenancy
- **Shared Schema Approach**: Uses a single database with tenant isolation through `tenantId` fields
- **Tenant Isolation**: Strict data separation between tenants (Acme and Globex)
- **Scalable Architecture**: Easy to add new tenants without schema changes

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based login system
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Tenant-aware Authentication**: Users are scoped to their specific tenant

### Subscription Management
- **Free Plan**: Limited to 3 notes per tenant
- **Pro Plan**: Unlimited notes
- **Upgrade Endpoint**: Admins can upgrade tenants to Pro plan

### Notes Management
- **Full CRUD Operations**: Create, read, update, and delete notes
- **Tenant Isolation**: Notes are strictly isolated by tenant
- **User Attribution**: Track who created each note

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID columns** approach:

### Advantages:
- **Cost-effective**: Single database instance
- **Easy maintenance**: One codebase, one deployment
- **Scalable**: Can handle hundreds of tenants
- **Simple queries**: Standard MongoDB queries with tenant filtering

### Implementation:
- All data models include a `tenantId` field
- Database queries are filtered by `tenantId`
- API middleware ensures tenant isolation
- Indexes are created on `tenantId` for performance

### Security:
- All API endpoints validate user's tenant membership
- Database queries always include tenant filtering
- JWT tokens include tenant information
- Middleware prevents cross-tenant access

## Test Accounts

The following test accounts are available (password: `password` for all):

| Email | Role | Tenant | Subscription |
|-------|------|--------|-------------|
| admin@acme.test | Admin | Acme | Free |
| user@acme.test | Member | Acme | Free |
| admin@globex.test | Admin | Globex | Free |
| user@globex.test | Member | Globex | Free |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Notes (CRUD)
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro (Admin only)

### System
- `GET /api/health` - Health check endpoint
- `POST /api/seed` - Seed database with test data

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yardstick_1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/yardstick_notes
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed the database**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Seeding

The application includes a seed endpoint that creates:
- Two tenants: Acme and Globex
- Four test users with predefined roles
- Sample notes for each tenant

To seed the database:
```bash
curl -X POST http://localhost:3000/api/seed
```

## Deployment on Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas cluster
- GitHub repository (optional, but recommended)

### Steps

1. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Whitelist all IP addresses (0.0.0.0/0) for Vercel

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   In your Vercel project settings, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (32+ characters)

4. **Seed Production Database**
   ```bash
   curl -X POST https://your-app.vercel.app/api/seed
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-jwt-key-32-chars-min` |

## Security Features

- **CORS Enabled**: API accessible from external scripts
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Tenant Isolation**: Strict data separation
- **Role-based Access**: Admin vs Member permissions
- **Input Validation**: Server-side validation for all inputs

## Architecture

```
Frontend (Next.js)
├── Authentication Context
├── Login Form
├── Notes Management
└── Layout Components

Backend (API Routes)
├── Authentication Middleware
├── Tenant Isolation
├── Notes CRUD
└── Subscription Management

Database (MongoDB)
├── Tenants Collection
├── Users Collection (with tenantId)
└── Notes Collection (with tenantId)
```

## Testing

### Manual Testing
1. **Login with test accounts**
2. **Create notes** (test 3-note limit on free plan)
3. **Switch between tenants** (login with different accounts)
4. **Test upgrade** (admin accounts can upgrade to Pro)
5. **Verify isolation** (notes from one tenant not visible to another)

### API Testing
Use the health endpoint to verify deployment:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{"status": "ok"}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas IP whitelist
   - Ensure database user has proper permissions

2. **Authentication Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration (24 hours)
   - Ensure user exists in correct tenant

3. **Tenant Isolation Issues**
   - Verify all queries include `tenantId` filter
   - Check user's tenant membership
   - Review API middleware implementation

### Logs
Check Vercel function logs for debugging:
```bash
vercel logs <deployment-url>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
