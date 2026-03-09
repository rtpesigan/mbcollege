#!/bin/bash

echo "🚀 Setting up Metro Business College Enrollment Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found. Please ensure MySQL 8.0+ is installed and running."
    echo "   You can install MySQL from: https://dev.mysql.com/downloads/mysql/"
    echo ""
    echo "   After installation, create a database:"
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE mbc_enrollment;"
    echo ""
    read -p "Press Enter to continue after setting up MySQL..."
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
    echo ""
    echo "   Edit .env and update:"
    echo "   DATABASE_URL=\"mysql://username:password@localhost:3306/mbc_enrollment\""
    echo "   NEXTAUTH_SECRET=\"your-secret-key-here\""
    echo "   JWT_SECRET=\"your-jwt-secret-here\""
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin: admin@mbc.edu.ph / admin123"
echo "   Registrar: registrar@mbc.edu.ph / registrar123"
echo "   Student: student@mbc.edu.ph / password123"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
