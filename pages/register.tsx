'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { RegisterForm } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
  EyeIcon, 
  EyeSlashIcon,
  CloudArrowUpIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  studentId: z.string().optional(),
  course: z.string().optional(),
  yearLevel: z.coerce.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function Register() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [idPicture, setIdPicture] = useState<File | null>(null)
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  useEffect(() => {
    if (password) {
      let strength = 0
      if (password.length >= 8) strength++
      if (password.match(/[a-z]/)) strength++
      if (password.match(/[A-Z]/)) strength++
      if (password.match(/[0-9]/)) strength++
      if (password.match(/[^a-zA-Z0-9]/)) strength++
      setPasswordStrength(strength)
    }
  }, [password])

  const onDropIdPicture = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIdPicture(acceptedFiles[0])
    }
  }

  const onDropBirthCertificate = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setBirthCertificate(acceptedFiles[0])
    }
  }

  const { getRootProps: getIdRootProps, getInputProps: getIdInputProps, isDragActive: isIdDragActive } = useDropzone({
    onDrop: onDropIdPicture,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  })

  const { getRootProps: getBirthRootProps, getInputProps: getBirthInputProps, isDragActive: isBirthDragActive } = useDropzone({
    onDrop: onDropBirthCertificate,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      if (data.phone) formData.append('phone', data.phone)
      if (data.address) formData.append('address', data.address)
      if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth)
      if (data.studentId) formData.append('studentId', data.studentId)
      if (data.course) formData.append('course', data.course)
      if (data.yearLevel) formData.append('yearLevel', data.yearLevel.toString())
      if (idPicture) formData.append('idPicture', idPicture)
      if (birthCertificate) formData.append('birthCertificate', birthCertificate)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Registration successful! Please login to continue.')
        router.push('/login')
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ['email', 'password', 'confirmPassword'] : 
                           currentStep === 2 ? ['firstName', 'lastName'] : []
    
    const isValid = await trigger(fieldsToValidate as any)
    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-danger-500'
    if (passwordStrength <= 3) return 'bg-warning-500'
    return 'bg-success-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Metro Business College and start your academic journey
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${step < currentStep ? 'bg-primary-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Account Info</span>
            <span className="text-xs text-gray-600">Personal Info</span>
            <span className="text-xs text-gray-600">Academic Info</span>
            <span className="text-xs text-gray-600">Documents</span>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      className={`form-input pr-10 ${errors.email ? 'form-input-error' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">Student ID (Optional)</label>
                  <div className="relative">
                    <input
                      {...register('studentId')}
                      type="text"
                      className="form-input pr-10"
                      placeholder="Leave blank if not assigned"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input pr-10 ${errors.password ? 'form-input-error' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Password Strength</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-danger-600' :
                          passwordStrength <= 3 ? 'text-warning-600' : 'text-success-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className={`progress-bar ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input pr-10 ${errors.confirmPassword ? 'form-input-error' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                  {confirmPassword && (
                    <p className={`mt-1 text-xs ${
                      password === confirmPassword ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                      placeholder="Dela Cruz"
                    />
                    {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="form-input"
                    placeholder="09123456789"
                  />
                </div>

                <div>
                  <label className="form-label">Date of Birth</label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="form-textarea"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Academic Information */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="form-label">Course</label>
                  <select {...register('course')} className="form-select">
                    <option value="">Select a course</option>
                    <option value="BSBA">Bachelor of Science in Business Administration</option>
                    <option value="BSIT">Bachelor of Science in Information Technology</option>
                    <option value="BSTM">Bachelor of Science in Tourism Management</option>
                    <option value="BSHM">Bachelor of Science in Hospitality Management</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Year Level</label>
                  <select {...register('yearLevel')} className="form-select">
                    <option value="">Select year level</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="form-label">ID Picture</label>
                  <div
                    {...getIdRootProps()}
                    className={`upload-area ${isIdDragActive ? 'dragover' : ''}`}
                  >
                    <input {...getIdInputProps()} />
                    {idPicture ? (
                      <div className="text-center">
                        <div className="mb-4">
                          <img
                            src={URL.createObjectURL(idPicture)}
                            alt="ID Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-600">{idPicture.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIdPicture(null)
                          }}
                          className="mt-2 text-sm text-danger-600 hover:text-danger-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p>Click to upload or drag and drop</p>
                          <p className="pl-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Birth Certificate</label>
                  <div
                    {...getBirthRootProps()}
                    className={`upload-area ${isBirthDragActive ? 'dragover' : ''}`}
                  >
                    <input {...getBirthInputProps()} />
                    {birthCertificate ? (
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="mx-auto h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{birthCertificate.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBirthCertificate(null)
                          }}
                          className="mt-2 text-sm text-danger-600 hover:text-danger-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p>Click to upload or drag and drop</p>
                          <p className="pl-1">PDF, PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                >
                  Previous
                </button>
              )}

              <div className="ml-auto">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className="btn btn-primary"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
