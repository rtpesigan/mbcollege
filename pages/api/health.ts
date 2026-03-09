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
      DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
      NODE_ENV: process.env.NODE_ENV,
    }

    // Try to connect to database
    let dbStatus = 'Unknown'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = '✓ Connected'
    } catch (dbError: any) {
      dbStatus = `✗ Error: ${dbError.message}`
    }

    res.status(200).json({
      status: 'ok',
      environment: envVars,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
}
