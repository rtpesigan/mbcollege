'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { useRequireRole } from '@/hooks/useRequireRole'

type ApplicationRow = {
  id: string
  student: string
  course: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
}

export default function RegistrarPage() {
  const { status, isAllowed } = useRequireRole(['ADMIN', 'REGISTRAR'])

  const [rows] = useState<ApplicationRow[]>([
    { id: '1', student: 'Juan Dela Cruz', course: 'BSIT', status: 'PENDING', submittedAt: '2025-01-03' },
    { id: '2', student: 'Maria Santos', course: 'BSTM', status: 'APPROVED', submittedAt: '2025-01-04' },
  ])

  if (status !== 'authenticated' || !isAllowed) return null

  return (
    <Layout title="Registrar">
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
              <p className="mt-1 text-sm text-slate-600">Review incoming applications and verify documents.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary">Export</button>
              <button className="btn btn-primary">New Evaluation</button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Student</th>
                  <th className="table-header-cell">Course</th>
                  <th className="table-header-cell">Submitted</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell font-medium text-slate-900">{r.student}</td>
                    <td className="table-cell">{r.course}</td>
                    <td className="table-cell">{r.submittedAt}</td>
                    <td className="table-cell">
                      <span
                        className={
                          r.status === 'APPROVED'
                            ? 'badge badge-success'
                            : r.status === 'PENDING'
                              ? 'badge badge-warning'
                              : 'badge badge-danger'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-outline">View</button>
                        <button className="btn btn-primary">Approve</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Pending (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">4</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Approved (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">12</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Rejected (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">1</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
