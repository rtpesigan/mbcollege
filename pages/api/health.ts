import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check environment variables
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
      NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL || 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? '✓ Set (Hidden)' : '✗ Missing',
      DATABASE_HOST: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'Unknown',
      JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
      NODE_ENV: process.env.NODE_ENV,
    }

    // Try to connect to database
    let dbStatus = 'Unknown'
    let dbError = null
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = '✓ Connected'
    } catch (dbErrorObj: any) {
      dbStatus = '✗ Failed to Connect'
      dbError = dbErrorObj.message
    }

    const allVarsSet = Object.values(envVars).every(v => v !== '✗ Missing' && v !== null)

    res.status(200).json({
      status: allVarsSet && dbStatus === '✓ Connected' ? 'healthy' : 'unhealthy',
      environment: envVars,
      database: {
        status: dbStatus,
        error: dbError,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}
