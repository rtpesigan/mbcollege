@echo off
echo 🚀 Setting up Metro Business College Enrollment Management System...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env >nul
    echo ✅ .env file created. Please update it with your database credentials.
    echo.
    echo    Edit .env and update:
    echo    DATABASE_URL="mysql://username:password@localhost:3306/mbc_enrollment"
    echo    NEXTAUTH_SECRET="your-secret-key-here"
    echo    JWT_SECRET="your-jwt-secret-here"
    echo.
    pause
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Push database schema
echo 🗄️  Setting up database schema...
call npx prisma db push

if %errorlevel% neq 0 (
    echo ❌ Failed to setup database schema
    echo    Please ensure MySQL is running and the database exists
    echo    Run: mysql -u root -p
    echo    CREATE DATABASE mbc_enrollment;
    pause
    exit /b 1
)

REM Seed database
echo 🌱 Seeding database with demo data...
call npm run db:seed

if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 👤 Demo Accounts:
echo    Admin: admin@mbc.edu.ph / admin123
echo    Registrar: registrar@mbc.edu.ph / registrar123
echo    Student: student@mbc.edu.ph / password123
echo.
echo 🚀 Start the development server:
echo    npm run dev
echo.
echo 🌐 Open your browser and navigate to:
echo    http://localhost:3000
echo.
echo 📚 For more information, see README.md
echo.
pause
