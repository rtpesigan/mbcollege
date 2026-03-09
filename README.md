# Metro Business College - Enrollment Management System

A modern, comprehensive enrollment management system built with Next.js, TypeScript, React, and MySQL. This system provides a paperless, efficient way to manage student enrollment, payments, grades, and administrative tasks.

## 🎯 Features

### Core Features
- **Student Registration Module** - Online account creation with document upload
- **Enrollment Dashboard** - Track enrollment status and academic progress
- **Payment Module** - Multiple payment options with receipt generation
- **Admin Panel** - Manage applicants, courses, and view analytics
- **Registrar Module** - Document verification and section assignment
- **Grade Management** - Track and manage student grades
- **Role-based Access Control** - Secure authentication for different user types

### Technical Features
- **Modern UI/UX** - Clean, responsive design with blue, white, and gold theme
- **Real-time Updates** - Live status tracking and notifications
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile
- **TypeScript** - Type-safe development
- **Database Management** - MySQL with Prisma ORM
- **Authentication** - Secure login with NextAuth.js
- **File Upload** - Drag-and-drop document upload
- **Data Visualization** - Charts and analytics dashboard

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Charts**: Chart.js with React-Chartjs-2
- **File Upload**: React Dropzone
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mbc-enrollment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/mbc_enrollment"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   JWT_SECRET="your-jwt-secret-here"
   ```

4. **Set up the database**
   ```bash
   # Create database in MySQL
   mysql -u root -p
   CREATE DATABASE mbc_enrollment;
   
   # Run Prisma migrations
   npx prisma db push
   
   # Seed the database with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Demo Accounts

After running the seed command, you can use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mbc.edu.ph | admin123 |
| Registrar | registrar@mbc.edu.ph | registrar123 |
| Student | student@mbc.edu.ph | password123 |

## 🏗️ Project Structure

```
mbc-enrollment-system/
├── components/          # Reusable React components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── lib/                # Utility libraries
│   └── prisma.ts       # Prisma client
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── dashboard.tsx   # Main dashboard
│   ├── login.tsx       # Login page
│   └── register.tsx    # Registration page
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seed data
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS + custom styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Professional blue, white, and gold accents
- **Typography**: Clean, readable Inter font
- **Components**: Consistent, reusable UI components
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design
- **Mobile-first approach** with hamburger menu
- **Tablet optimization** for touch interactions
- **Desktop layout** with collapsible sidebar
- **Accessibility** features with proper ARIA labels

### Interactive Elements
- **Progress indicators** for multi-step forms
- **Real-time validation** with helpful error messages
- **Drag-and-drop** file upload with preview
- **Interactive charts** and data visualization
- **Hover effects** and smooth transitions

## 🔐 Security Features

- **Encrypted passwords** with bcrypt
- **JWT tokens** for secure authentication
- **Role-based access control** (Admin, Registrar, Student, Cashier)
- **Activity logging** for audit trails
- **Input validation** with Zod schemas
- **CSRF protection** with NextAuth.js

## 📊 Available Features

### Student Portal
- ✅ Online registration with document upload
- ✅ Personal information management
- ✅ Course and subject selection
- ✅ Payment processing and history
- ✅ Grade viewing
- ✅ Enrollment status tracking

### Admin Panel
- ✅ Student application management
- ✅ Course and subject management
- ✅ Tuition fee configuration
- ✅ Analytics and reporting
- ✅ System settings
- ✅ User management

### Registrar Module
- ✅ Document verification
- ✅ Section assignment
- ✅ Certificate of Registration generation
- ✅ Student ID printing
- ✅ Enrollment approval

### Payment Module
- ✅ Multiple payment methods (Cash, GCash, Bank Transfer)
- ✅ Payment history and receipts
- ✅ Fee breakdown and assessment
- ✅ Payment verification
- ✅ Financial reporting

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Get current session

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/analytics` - Get enrollment analytics

### Database Schema
The system uses the following main entities:
- **Users** - Students, admin, registrar, cashier accounts
- **Courses** - Academic programs offered
- **Subjects** - Individual subjects within courses
- **Applications** - Student enrollment applications
- **Documents** - Required document uploads
- **Enrollments** - Active student enrollments
- **Payments** - Financial transactions
- **Grades** - Academic performance records
- **ActivityLogs** - System audit trail

## 🚀 Deployment

### Environment Setup
1. Set up production database
2. Configure environment variables
3. Build the application
4. Deploy to your preferred hosting platform

### Production Build
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact:
- Email: support@mbc.edu.ph
- Phone: +63-2-1234-5678
- Address: Metro Business College, Manila, Philippines

## 🔄 Updates

### Version 1.0.0
- ✅ Core enrollment system
- ✅ User authentication
- ✅ Payment processing
- ✅ Document management
- ✅ Dashboard analytics
- ✅ Mobile responsive design

### Planned Features
- 🔄 Email notifications
- 🔄 SMS integration
- 🔄 Advanced reporting
- 🔄 Mobile app
- 🔄 Integration with school LMS
- 🔄 Biometric attendance
- 🔄 Online examinations

---

**Metro Business College Enrollment Management System** - Empowering education through technology 🎓
