'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'

type GradeRow = {
  id: string
  code: string
  subject: string
  midterm: number | null
  finals: number | null
  average: number | null
  remarks: string | null
  academicYear: string
  semester: number
}

export default function GradesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rows, setRows] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRows = async () => {
    try {
      setError(null)
      setLoading(true)
      const res = await fetch('/api/grades')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        setRows([])
        setError(json?.error || 'Failed to load grades')
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
    <Layout title="Grades">
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Academic Performance</h2>
              <p className="mt-1 text-sm text-slate-600">View midterm, finals, and computed averages.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={fetchRows}>Refresh</button>
              <button className="btn btn-secondary" disabled>Download Report</button>
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
                  <th className="table-header-cell">Midterm</th>
                  <th className="table-header-cell">Finals</th>
                  <th className="table-header-cell">Average</th>
                  <th className="table-header-cell">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr className="table-row">
                    <td className="table-cell" colSpan={7}>Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr className="table-row">
                    <td className="table-cell" colSpan={7}>No grades found.</td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell">{r.academicYear} / Sem {r.semester}</td>
                    <td className="table-cell font-medium text-slate-900">{r.code}</td>
                    <td className="table-cell">{r.subject}</td>
                    <td className="table-cell">{r.midterm ?? '—'}</td>
                    <td className="table-cell">{r.finals ?? '—'}</td>
                    <td className="table-cell">{r.average ?? '—'}</td>
                    <td className="table-cell">
                      <span className={r.remarks === 'Passed' ? 'badge badge-success' : 'badge badge-info'}>
                        {r.remarks || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm font-medium text-slate-600">GPA (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">1.85</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Units Completed (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">24</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Standing (sample)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">Good</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
