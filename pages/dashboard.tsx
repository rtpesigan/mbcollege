'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import { 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  DocumentIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { DashboardStats, EnrollmentAnalytics } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<EnrollmentAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'REGISTRAR'
      fetchDashboardData(isAdmin)
    }
  }, [status, router, session])

  const fetchDashboardData = async (isAdmin: boolean) => {
    try {
      const requests: Promise<Response>[] = [fetch('/api/dashboard/stats')]
      if (isAdmin) {
        requests.push(fetch('/api/dashboard/analytics'))
      }

      const [statsRes, analyticsRes] = await Promise.all(requests)

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (isAdmin && analyticsRes && analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data)
      } else if (!isAdmin) {
        setAnalytics([])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const lineChartData = {
    labels: analytics.map(item => item.date),
    datasets: [
      {
        label: 'New Applications',
        data: analytics.map(item => item.applications),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Approved',
        data: analytics.map(item => item.approved),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const doughnutChartData = {
    labels: ['BSBA', 'BSIT', 'BSTM', 'BSHM'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'REGISTRAR'

  return (
    <Layout title="Dashboard">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Metro Business College
                <span className="text-yellow-400 ml-2">🎓</span>
              </h1>
              <p className="text-primary-100 text-lg">
                {isAdmin 
                  ? 'Manage enrollment and monitor student progress'
                  : 'Track your academic journey and manage enrollment'
                }
              </p>
            </div>
            <div className="hidden md:flex space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{stats?.totalStudents || 0} Students</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{stats?.pendingApplications || 0} Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UserGroupIcon}
          label="Total Students"
          value={isAdmin ? stats?.totalStudents || 0 : stats?.documentsSubmitted || 0}
          color="primary"
          progress={isAdmin ? 85 : 60}
        />
        <StatCard
          icon={CheckCircleIcon}
          label={isAdmin ? "Approved Students" : "Payments Made"}
          value={isAdmin ? stats?.approvedStudents || 0 : `₱${stats?.paymentsMade || 0}`}
          color="success"
          progress={isAdmin ? 94 : 75}
        />
        <StatCard
          icon={ClockIcon}
          label={isAdmin ? "Pending Applications" : "Subjects Enrolled"}
          value={isAdmin ? stats?.pendingApplications || 0 : stats?.subjectsEnrolled || 0}
          color="warning"
          progress={isAdmin ? 15 : 100}
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label={isAdmin ? "Total Revenue" : "Days Active"}
          value={isAdmin ? `₱${stats?.totalRevenue || 0}` : stats?.daysActive || 0}
          color="info"
          progress={isAdmin ? 78 : 90}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {isAdmin ? (
            /* Admin Analytics */
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Analytics</h3>
                <div className="flex space-x-2">
                  <button className="btn btn-sm btn-outline">Week</button>
                  <button className="btn btn-sm btn-outline">Month</button>
                  <button className="btn btn-sm btn-outline">Year</button>
                </div>
              </div>
              <div className="card-body">
                <div className="h-64">
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          ) : (
            /* Student Progress */
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Progress</h3>
              </div>
              <div className="card-body">
                <EnrollmentTimeline />
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="btn btn-sm btn-outline">
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Student</th>
                      <th>Activity</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    <tr>
                      <td>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <UserGroupIcon className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Juan Dela Cruz</div>
                            <div className="text-sm text-gray-500">BSIT-2024-001</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">Document Upload</div>
                          <div className="text-sm text-gray-500">Birth Certificate</div>
                        </div>
                      </td>
                      <td>2 hours ago</td>
                      <td>
                        <span className="badge badge-warning">Pending Review</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
                            <UserGroupIcon className="w-4 h-4 text-success-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Maria Santos</div>
                            <div className="text-sm text-gray-500">BSTM-2024-015</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">Payment Completed</div>
                          <div className="text-sm text-gray-500">Tuition Fee - 1st Installment</div>
                        </div>
                      </td>
                      <td>5 hours ago</td>
                      <td>
                        <span className="badge badge-success">Completed</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isAdmin ? (
            <>
              {/* Pending Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
                </div>
                <div className="card-body space-y-3">
                  <div className="alert alert-warning">
                    <div className="flex items-center">
                      <DocumentIcon className="w-5 h-5 mr-2" />
                      <div>
                        <div className="font-medium">23 documents pending verification</div>
                      </div>
                    </div>
                  </div>
                  <div className="alert alert-info">
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2" />
                      <div>
                        <div className="font-medium">15 applications awaiting approval</div>
                      </div>
                    </div>
                  </div>
                  <div className="alert alert-success">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                      <div>
                        <div className="font-medium">7 payments to verify</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Distribution */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Course Distribution</h3>
                </div>
                <div className="card-body">
                  <div className="h-48">
                    <Doughnut data={doughnutChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-body space-y-3">
                  <button className="btn btn-primary w-full">
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    New Application
                  </button>
                  <button className="btn btn-success w-full">
                    <DocumentIcon className="w-4 h-4 mr-2" />
                    Upload Documents
                  </button>
                  <button className="btn btn-warning w-full">
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Select Subjects
                  </button>
                  <button className="btn btn-info w-full">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    Make Payment
                  </button>
                </div>
              </div>

              {/* Documents Status */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                </div>
                <div className="card-body space-y-3">
                  <DocumentItem name="Birth Certificate" status="completed" />
                  <DocumentItem name="ID Picture" status="completed" />
                  <DocumentItem name="Form 137" status="pending" />
                  <DocumentItem name="Good Moral" status="pending" />
                  <DocumentItem name="Medical Certificate" status="pending" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

interface StatCardProps {
  icon: React.ComponentType<any>
  label: string
  value: string | number
  color: 'primary' | 'success' | 'warning' | 'info'
  progress: number
}

function StatCard({ icon: Icon, label, value, color, progress }: StatCardProps) {
  const colorClasses = {
    primary: 'stat-icon-primary',
    success: 'stat-icon-success',
    warning: 'stat-icon-warning',
    info: 'stat-icon-info',
  }

  const progressColorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    info: 'bg-info-500',
  }

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 mb-3">{label}</div>
      <div className="progress">
        <div 
          className={`progress-bar ${progressColorClasses[color]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function DocumentItem({ name, status }: { name: string; status: 'completed' | 'pending' }) {
  const statusConfig = {
    completed: {
      icon: CheckCircleIcon,
      color: 'text-success-600',
      badge: 'badge-success',
      text: 'Uploaded',
    },
    pending: {
      icon: ClockIcon,
      color: 'text-warning-600',
      badge: 'badge-warning',
      text: 'Pending',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-3 ${config.color}`} />
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </div>
      <span className={`badge ${config.badge}`}>{config.text}</span>
    </div>
  )
}

function EnrollmentTimeline() {
  type TimelineStatus = 'completed' | 'active' | 'pending'

  const steps: Array<{
    name: string
    status: TimelineStatus
    icon: typeof CheckCircleIcon
  }> = [
    { name: 'Account Registration', status: 'completed', icon: CheckCircleIcon },
    { name: 'Personal Information', status: 'completed', icon: CheckCircleIcon },
    { name: 'Document Submission', status: 'active', icon: DocumentIcon },
    { name: 'Subject Enrollment', status: 'pending', icon: BookOpenIcon },
    { name: 'Final Approval', status: 'pending', icon: CheckCircleIcon },
  ]

  const statusColors: Record<TimelineStatus, string> = {
    completed: 'bg-success-500 text-white',
    active: 'bg-warning-500 text-white',
    pending: 'bg-gray-300 text-gray-600',
  }

  return (
    <div className="timeline">
      {steps.map((step, index) => {
        const Icon = step.icon

        return (
          <div key={index} className="timeline-item">
            <div className={`timeline-marker ${statusColors[step.status]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="timeline-content">
              <h4 className="font-medium text-gray-900">{step.name}</h4>
              <p className="text-sm text-gray-500">
                {step.status === 'completed' && 'Completed'}
                {step.status === 'active' && 'In Progress'}
                {step.status === 'pending' && 'Available Soon'}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
