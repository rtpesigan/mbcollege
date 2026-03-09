'use client'

import Layout from '@/components/layout/Layout'
import { useRequireRole } from '@/hooks/useRequireRole'

export default function CashierPage() {
  const { status, isAllowed } = useRequireRole(['CASHIER', 'ADMIN'])

  if (status !== 'authenticated' || !isAllowed) return null

  return (
    <Layout title="Cashier">
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment Verification Queue</h2>
              <p className="mt-1 text-sm text-slate-600">Review pending payments and approve or reject them.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" disabled>Refresh</button>
              <button className="btn btn-primary" disabled>Bulk Approve</button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Student</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Method</th>
                  <th className="table-header-cell">Reference</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="table-row">
                  <td className="table-cell">Juan Dela Cruz</td>
                  <td className="table-cell">₱15,000</td>
                  <td className="table-cell">GCASH</td>
                  <td className="table-cell">REF-XXXXXXX</td>
                  <td className="table-cell"><span className="badge badge-warning">PENDING</span></td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline" disabled>View</button>
                      <button className="btn btn-primary" disabled>Approve</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
