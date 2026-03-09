'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'

type EnrollmentRow = {
  id: string
  code: string
  subject: string
  units: number
  status: string
  semester: number
  academicYear: string
}

export default function EnrollmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rows, setRows] = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalUnits = useMemo(() => rows.reduce((sum, r) => sum + (r.units || 0), 0), [rows])

  const fetchRows = async () => {
    try {
      setError(null)
      setLoading(true)
      const res = await fetch('/api/enrollment')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        setRows([])
        setError(json?.error || 'Failed to load enrollment data')
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
    <Layout title="Enrollment">
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Current Enrollment</h2>
              <p className="mt-1 text-sm text-slate-600">Review your enrolled subjects and request changes.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline" onClick={fetchRows}>Refresh</button>
              <button className="btn btn-secondary" disabled>Request Change</button>
              <button className="btn btn-primary" disabled>Add Subject</button>
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
                  <th className="table-header-cell">Term</th>
                  <th className="table-header-cell">Code</th>
                  <th className="table-header-cell">Subject</th>
                  <th className="table-header-cell">Units</th>
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
                    <td className="table-cell" colSpan={6}>No enrollment records found.</td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell">{r.academicYear} / Sem {r.semester}</td>
                    <td className="table-cell font-medium text-slate-900">{r.code}</td>
                    <td className="table-cell">{r.subject}</td>
                    <td className="table-cell">{r.units}</td>
                    <td className="table-cell">
                      <span
                        className={
                          r.status === 'ACTIVE'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900">Academic Year</h3>
            <p className="mt-2 text-sm text-slate-600">{rows[0]?.academicYear || '—'}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900">Semester</h3>
            <p className="mt-2 text-sm text-slate-600">{rows[0]?.semester ? `Semester ${rows[0].semester}` : '—'}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900">Total Units</h3>
            <p className="mt-2 text-sm text-slate-600">{totalUnits}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
