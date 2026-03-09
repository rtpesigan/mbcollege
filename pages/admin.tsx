'use client'

import Layout from '@/components/layout/Layout'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function AdminPage() {
  const { status, isAllowed } = useRequireRole(['ADMIN'])

  if (status !== 'authenticated' || !isAllowed) return null

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">System Administration</h2>
          <p className="mt-1 text-sm text-slate-600">Manage system settings, users, and access control.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary">Manage Users</button>
            <button className="btn btn-secondary">System Settings</button>
            <button className="btn btn-outline">Activity Logs</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <button className="btn btn-outline w-full">Create Course</button>
              <button className="btn btn-outline w-full">Create Subject</button>
              <button className="btn btn-outline w-full">Approve Payments</button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900">System Status</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Database</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Connected</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auth</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">NextAuth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
