'use client'
import { useTransition } from 'react'
import { login } from '@/app/actions/auth'
import { toast as sonnerToast } from 'sonner'
import { Shield, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('isAdminLogin', 'true')
    
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        sonnerToast.error(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">เข้าสู่ระบบสำหรับผู้ดูแลระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Admin Username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
            <input
              type="password"
              name="pin"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'เข้าสู่ระบบ Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
