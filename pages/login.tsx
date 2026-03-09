'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Login successful!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-200/70 via-primary-100/40 to-secondary-100/50 blur-3xl" />
          <div className="absolute -bottom-56 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-secondary-200/50 via-white/30 to-primary-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="hidden lg:block">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-secondary-500" />
                Secure portal
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
                Metro Business College
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Paperless enrollment made simple. Track your application, submit requirements, and manage payments in one place.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Fast</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Less queues</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Accurate</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Central records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-sm">
                    <AcademicCapIcon className="h-7 w-7 text-white" width={28} height={28} style={{ width: 28, height: 28 }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
                    <p className="text-sm text-slate-500">Use your email and password to continue.</p>
                  </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                        placeholder="you@mbc.edu.ph"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" width={20} height={20} style={{ width: 20, height: 20 }} />
                        ) : (
                          <EyeIcon className="h-5 w-5" width={20} height={20} style={{ width: 20, height: 20 }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      Remember me
                    </label>
                    <a href="#" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="spinner h-5 w-5" />
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-500">New student?</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Create an account
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-700">Demo accounts</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold">Student:</span> student@mbc.edu.ph / password123</p>
                    <p><span className="font-semibold">Admin:</span> admin@mbc.edu.ph / admin123</p>
                    <p><span className="font-semibold">Registrar:</span> registrar@mbc.edu.ph / registrar123</p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Metro Business College. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
