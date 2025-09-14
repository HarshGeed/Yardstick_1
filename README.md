# Multi-Tenant SaaS Notes Application

A full-stack multi-tenant SaaS Notes Application built with Next.js, MongoDB, and deployed on Vercel. This application supports multiple tenants (companies) with strict data isolation, role-based access control, and subscription-based feature gating.

## Features

- **Multi-Tenancy**: Support for multiple tenants (Acme and Globex) with strict data isolation
- **Authentication**: JWT-based authentication system
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Subscription Management**: Free (3 notes limit) and Pro (unlimited) plans
- **Notes CRUD**: Full create, read, update, delete operations for notes
- **CORS Enabled**: API accessible from external applications
- **Vercel Deployment**: Ready for production deployment

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID columns** approach:

- All collections (Tenant, User, Note) share the same MongoDB database
- Tenant isolation is enforced through `tenantId` fields in User and Note collections
- All API endpoints validate tenant membership before allowing access
- This approach provides good performance while maintaining strict data isolation

## Architecture

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/login/      # Authentication endpoint
│   │   ├── health/          # Health check endpoint
│   │   ├── notes/           # Notes CRUD endpoints
│   │   └── tenants/         # Tenant management endpoints
│   ├── dashboard/           # Dashboard page
│   └── page.tsx             # Login page
├── components/              # React components
│   ├── LoginForm.tsx        # Login form component
│   └── Dashboard.tsx        # Main dashboard component
├── lib/                     # Utility libraries
│   ├── auth.ts              # JWT authentication utilities
│   ├── cors.ts              # CORS configuration
│   ├── middleware.ts        # Authentication middleware
│   └── mongodb.ts           # MongoDB connection
├── models/                  # Mongoose models
│   ├── Tenant.ts            # Tenant model
│   ├── User.ts              # User model
│   └── Note.ts              # Note model
└── scripts/
    └── seed.ts              # Database seeding script
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Health Check
- `GET /api/health` - Application health status

### Notes (Protected)
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management (Admin Only)
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan

## Test Accounts

The following test accounts are pre-configured (password: `password`):

| Email | Role | Tenant |
|-------|------|--------|
| admin@acme.test | Admin | Acme |
| user@acme.test | Member | Acme |
| admin@globex.test | Admin | Globex |
| user@globex.test | Member | Globex |

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yardstick_1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB connection string and JWT secret:
```env
MONGODB_URI=mongodb://localhost:27017/notes-saas
JWT_SECRET=your-super-secret-jwt-key-here
```

4. Seed the database with test accounts:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment on Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas account (recommended for production)

### Steps

1. **Set up MongoDB Atlas**:
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Whitelist Vercel's IP ranges

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure Environment Variables**:
   In your Vercel dashboard, add these environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong secret key for JWT signing

4. **Seed Production Database**:
   After deployment, run the seed script to create test accounts:
   ```bash
   vercel env pull .env.local
   npm run seed
   ```

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- All CRUD operations available
- Upgrade option visible to admins

### Pro Plan
- Unlimited notes
- All CRUD operations available
- No upgrade restrictions

## Security Features

- **Tenant Isolation**: Strict data separation between tenants
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and Member roles with appropriate permissions
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **CORS Configuration**: Controlled cross-origin access

## Development

### Running Tests
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

### Building for Production
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
