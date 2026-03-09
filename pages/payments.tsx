'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'

type PaymentRow = {
  id: string
  createdAt: string
  description: string | null
  paymentMethod: string
  amount: number
  status: string
  referenceNo: string | null
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rows, setRows] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRows = async () => {
    try {
      setError(null)
      setLoading(true)
      const res = await fetch('/api/payments')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        setRows([])
        setError(json?.error || 'Failed to load payments')
        return
      }
      setRows(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      setRows([])
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = useMemo(() => rows.filter((r) => r.status === 'APPROVED').reduce((s, r) => s + r.amount, 0), [rows])
  const totalPending = useMemo(() => rows.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0), [rows])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchRows()
    }
  }, [status, router])

  if (status !== 'authenticated' || !session) return null

  return (
    <Layout title="Payments">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Total Paid</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">₱{totalPaid.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">₱{totalPending.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Actions</p>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-outline" onClick={fetchRows}>Refresh</button>
              <button className="btn btn-primary" disabled>Upload Proof</button>
              <button className="btn btn-secondary" disabled>New Payment</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
              <p className="mt-1 text-sm text-slate-600">Track your transactions and verification status.</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 alert alert-danger">
              <div className="font-medium">{error}</div>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Description</th>
                  <th className="table-header-cell">Method</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr className="table-row">
                    <td className="table-cell" colSpan={6}>Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr className="table-row">
                    <td className="table-cell" colSpan={6}>No payments found.</td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell font-medium text-slate-900">{r.description || '—'}</td>
                    <td className="table-cell">{r.paymentMethod}</td>
                    <td className="table-cell">₱{r.amount.toLocaleString()}</td>
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
                      <button className="btn btn-outline" disabled>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
