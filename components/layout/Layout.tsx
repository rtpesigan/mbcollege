'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Enrollment', href: '/enrollment', icon: AcademicCapIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Grades', href: '/grades', icon: ChartBarIcon },
]

const registrarNavigation = [
  { name: 'Registrar', href: '/registrar', icon: UserCircleIcon },
]

const cashierNavigation = [
  { name: 'Cashier', href: '/cashier', icon: CreditCardIcon },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: CogIcon },
]

export default function Layout({ children, title = 'Dashboard' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!session) {
    return <>{children}</>
  }

  const userRole = session.user?.role
  const isAdmin = userRole === 'ADMIN'
  const isRegistrar = userRole === 'ADMIN' || userRole === 'REGISTRAR'
  const isCashier = userRole === 'ADMIN' || userRole === 'CASHIER'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-primary-700 via-primary-800 to-slate-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-white/10">
                <AcademicCapIcon className="w-5 h-5 text-white" width={20} height={20} style={{ width: 20, height: 20 }} />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <h1 className="text-sm font-semibold text-white leading-tight">Metro Business College</h1>
                <p className="text-xs text-white/70">Enrollment Management</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <div className={sidebarCollapsed ? 'space-y-2' : 'space-y-1'}>
            {navigation.map((item) => {
              const isActive = router.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
                    ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  {!sidebarCollapsed && (
                    <span
                      className={
                        isActive
                          ? 'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-secondary-400'
                          : 'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-transparent'
                      }
                    />
                  )}
                  <item.icon className={`
                    ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                    ${isActive ? 'text-secondary-300' : 'text-white/65 group-hover:text-secondary-300'}
                  `} />
                  {!sidebarCollapsed && item.name}
                </Link>
              )
            })}
          </div>

          {(isRegistrar || isCashier || isAdmin) && (
            <div className="mt-8">
              <h3 className={`px-3 text-xs font-semibold text-white/60 uppercase tracking-wider ${sidebarCollapsed ? 'hidden' : ''}`}>
                Management
              </h3>
              <div className="mt-2 space-y-1">
                {isRegistrar && registrarNavigation.map((item) => {
                  const isActive = router.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={
                        `
                        group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
                        ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `
                      }
                    >
                      <item.icon className={
                        `
                        ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                        ${isActive ? 'text-secondary-300' : 'text-white/65 group-hover:text-secondary-300'}
                      `
                      } />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  )
                })}

                {isCashier && cashierNavigation.map((item) => {
                  const isActive = router.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={
                        `
                        group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
                        ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `
                      }
                    >
                      <item.icon className={
                        `
                        ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                        ${isActive ? 'text-secondary-300' : 'text-white/65 group-hover:text-secondary-300'}
                      `
                      } />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  )
                })}

                {isAdmin && adminNavigation.map((item) => {
                  const isActive = router.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
                        ${isActive ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <item.icon className={`
                        ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}
                        ${isActive ? 'text-secondary-300' : 'text-white/65 group-hover:text-secondary-300'}
                      `} />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex-shrink-0">
              {session.user?.image ? (
                <img
                  className="w-8 h-8 rounded-full"
                  src={session.user.image}
                  alt="Profile"
                />
              ) : (
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center ring-1 ring-white/10">
                  <UserCircleIcon className="w-5 h-5 text-white/80" />
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {session.user?.firstName} {session.user?.lastName}
                </p>
                <p className="text-xs text-white/65">
                  {session.user?.role?.toLowerCase()}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-white/10 rounded-xl hover:bg-white/15 transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:pl-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Bar */}
        <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:block p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
                <div className="ml-4">
                  <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
                  <p className="text-sm text-slate-500">Welcome back, {session.user?.firstName}.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    {session.user?.image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt="Profile"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <UserCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
