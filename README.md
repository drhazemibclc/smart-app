# 🏥 Smart Clinic - Modern Healthcare Management System

A comprehensive, production-ready healthcare management platform built with cutting-edge technologies for pediatric and general medical practices. Features real-time patient management, growth tracking, immunization scheduling, and complete medical records management.

## 🌟 Key Features

### Patient Management
- **Comprehensive Patient Profiles** - Complete demographic and medical history tracking
- **Growth Monitoring** - WHO-standard growth charts with Z-score calculations
- **Immunization Tracking** - Automated vaccine scheduling with overdue alerts
- **Developmental Milestones** - Track motor, language, social, and cognitive development

### Clinical Operations
- **Appointment Scheduling** - Multi-provider calendar with conflict detection
- **Medical Records** - SOAP notes, diagnoses, prescriptions, and lab results
- **Vital Signs Tracking** - Real-time monitoring with historical trends
- **Prescription Management** - Drug database with dosage guidelines and interactions

### Administrative Features
- **Multi-Tenant Architecture** - Clinic isolation with role-based access control
- **Billing & Payments** - Invoice generation, payment tracking, and financial reporting
- **Analytics Dashboard** - Real-time insights into clinic operations
- **Audit Logging** - Complete activity tracking for compliance

### Advanced Capabilities
- **Real-Time Updates** - Instant synchronization across all devices
- **Offline Support** - Continue working without internet connectivity
- **Mobile Responsive** - Optimized for tablets and smartphones
- **Accessibility** - WCAG-compliant interface design

## 🚀 Technology Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** (Canary) - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with Server Components
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type-safe development
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Prisma 7.4](https://www.prisma.io/)** - Type-safe ORM with migrations
- **[Prisma Accelerate](https://www.prisma.io/accelerate)** - Connection pooling and caching

### Authentication & Authorization
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution
- **Multi-Factor Authentication** - Enhanced security with 2FA
- **Role-Based Access Control** - Granular permissions (Admin, Doctor, Staff, Patient)
- **OAuth Integration** - Google authentication support

### API & State Management
- **[tRPC 11](https://trpc.io/)** - End-to-end type-safe APIs
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Jotai](https://jotai.org/)** - Atomic state management

### UI & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library
- **[Recharts](https://recharts.org/)** - Composable charting library

### Development Tools
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Vitest](https://vitest.dev/)** - Lightning-fast unit testing
- **[Husky](https://typicode.github.io/husky/)** - Git hooks for quality control

### Monitoring & Analytics
- **[Sentry](https://sentry.io/)** - Error tracking and performance monitoring
- **[Pino](https://getpino.io/)** - High-performance logging

### Additional Technologies
- **[Redis (ioredis)](https://github.com/redis/ioredis)** - Caching and session storage
- **[BullMQ](https://docs.bullmq.io/)** - Background job processing
- **[MinIO](https://min.io/)** - S3-compatible object storage
- **[Nodemailer](https://nodemailer.com/)** - Email delivery
- **[Zod](https://zod.dev/)** - Schema validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **Bun** 1.0 or higher (recommended) or npm/yarn/pnpm
- **PostgreSQL** 14.x or higher
- **Redis** 7.x or higher (optional, for caching)
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/smart-clinic.git
cd smart-clinic
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_clinic"

# Application URLs
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_API_KEY="your-api-key-here"
TRUST_PROXY=false

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# APIs & Services
SENTRY_AUTH_TOKEN="your-sentry-token"

# Development
NEXT_TELEMETRY_DISABLED=1
USE_LOCAL_ANALYTICS=true
USE_LOCAL_EMAIL=true
USE_LOCAL_STORAGE=true
```

### 4. Database Setup

```bash
# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database with initial data
bun run db:seed
```

### 5. Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## 📦 Available Scripts

### Development
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run clean        # Clean build artifacts
```

### Database
```bash
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run db:push      # Push schema changes
bun run db:seed      # Seed database
bun run db:studio    # Open Prisma Studio
bun run db:reset     # Reset database (⚠️ destructive)
```

### Code Quality
```bash
bun run lint         # Run Biome linter
bun run check        # Lint and auto-fix
bun run format       # Format code
bun run typecheck    # TypeScript type checking
bun run lint:css     # Lint CSS files
```

### Testing
```bash
bunx vitest run                              # Run all tests
bunx vitest run src/utils/some.test.ts       # Run specific test
bunx vitest run --reporter=verbose           # Verbose output
```

## 🏗️ Project Structure

```
smart-clinic/
├── src/
│   ├── actions/              # Server actions for data mutations
│   │   ├── auth/            # Authentication actions
│   │   ├── patient.action.ts
│   │   ├── appointment.action.ts
│   │   └── medical.action.ts
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (protected)/    # Protected routes
│   │   ├── (public)/       # Public pages
│   │   ├── api/            # API routes
│   │   └── dashboard/      # Main dashboard
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── patients/       # Patient-specific components
│   │   ├── appointment/    # Appointment components
│   │   └── medical-records/
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── server/             # Server-side code
│   │   ├── auth/           # Better Auth configuration
│   │   ├── db/             # Database utilities
│   │   │   ├── client.ts   # Prisma client
│   │   │   └── services/   # Business logic layer
│   │   └── redis/          # Redis client
│   ├── trpc/               # tRPC setup
│   │   ├── client.ts       # Client configuration
│   │   ├── server.ts       # Server configuration
│   │   └── routers/        # API routers
│   ├── utils/              # Utility functions
│   ├── generated/          # Auto-generated files
│   └── styles/             # Global styles
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed/               # Seed scripts
├── public/                 # Static assets
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── tests/                  # Test files
```

## 🎨 Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Server/Client Components)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Action Layer                    │
│  (Auth + Validation)                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Service Layer                   │
│  (Business Logic)                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Data Layer                      │
│  (Prisma Queries)                   │
└─────────────────────────────────────┘
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `PatientTable.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `usePatient.ts`)
- **Actions**: `kebab-case.action.ts` (e.g., `patient.action.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `patient.service.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE`

### Code Style

- **Line width**: 120 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always required
- **Trailing commas**: None

## 🔒 Security Features

### Authentication
- Secure password hashing with bcrypt
- JWT-based session management
- OAuth 2.0 integration (Google)
- Two-factor authentication support
- Rate limiting on auth endpoints

### Authorization
- Role-based access control (RBAC)
- Row-level security in database queries
- Multi-tenant data isolation
- Audit logging for all actions

### Data Protection
- HIPAA-compliant data handling
- Encrypted sensitive fields
- Secure file storage
- CORS protection
- XSS prevention
- CSRF protection

## 🚀 Performance Optimization

### Caching Strategy
- **Next.js Cache**: Server-side caching with `use cache`
- **React Query**: Client-side data synchronization
- **Redis**: Distributed caching for sessions
- **CDN**: Static asset delivery

### Database Optimization
- Connection pooling with Prisma
- Indexed queries for fast lookups
- Pagination for large datasets
- Selective field fetching

### Code Splitting
- Dynamic imports for large components
- Route-based code splitting
- Lazy loading for non-critical features

## 📊 Database Schema

### Core Models

- **User** - System users with authentication
- **Patient** - Patient demographics and medical info
- **Doctor** - Healthcare providers
- **Staff** - Administrative personnel
- **Appointment** - Scheduling and visits
- **MedicalRecords** - Clinical documentation
- **Prescription** - Medication orders
- **Immunization** - Vaccine administration
- **GrowthRecord** - Pediatric growth tracking
- **Payment** - Billing and invoices

See `prisma/schema.prisma` for complete schema definition.

## 🧪 Testing

### Unit Tests
```bash
bunx vitest run
```

### Integration Tests
```bash
bunx vitest run --integration
```

### Test Coverage
```bash
bunx vitest run --coverage
```

## 📚 Documentation

- **[Best Practices](docs/BEST_PRACTICES.md)** - Coding standards and patterns
- **[Next.js 16 Migration](docs/NEXTJS_16_MIGRATION.md)** - Upgrade guide
- **[tRPC Guide](docs/TRPC.md)** - API development
- **[Testing Guide](docs/TESTING.md)** - Testing strategies
- **[Prisma Guide](docs/Prisma.md)** - Database operations

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t smart-clinic .

# Run container
docker run -p 3000:3000 smart-clinic
```

### Environment Variables

Ensure all production environment variables are configured:
- Database connection string
- Authentication secrets
- OAuth credentials
- Sentry DSN
- Redis connection (if used)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards

- All tests must pass
- Code must be formatted with Biome
- TypeScript strict mode compliance
- No console.log in production code
- Meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **shadcn** - For the beautiful UI components
- **Better Auth** - For the authentication solution
- **tRPC Team** - For type-safe APIs

## 📞 Support

For support, email support@smartclinic.com or join our [Discord community](https://discord.gg/smartclinic).

## 🗺️ Roadmap

### Q1 2026
- [ ] Telemedicine integration
- [ ] Mobile app (React Native)
- [ ] AI-powered diagnosis assistance
- [ ] Multi-language support

### Q2 2026
- [ ] Laboratory integration
- [ ] Pharmacy management
- [ ] Insurance claim processing
- [ ] Advanced analytics

### Q3 2026
- [ ] Patient portal
- [ ] Wearable device integration
- [ ] Automated appointment reminders
- [ ] Voice-to-text clinical notes

---

**Built with ❤️ by the Smart Clinic Team**

*Making healthcare management simple, efficient, and accessible.*
