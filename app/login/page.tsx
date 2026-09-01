'use client'
import { useTransition } from 'react'
import { login } from '@/app/actions/auth'
import { User, KeyRound, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        toast.error('เข้าสู่ระบบไม่สำเร็จ', {
            description: result.error,
        })
      } else {
        toast.success('เข้าสู่ระบบสำเร็จ', {
            description: 'กำลังพาท่านเข้าสู่ระบบ...'
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
          <p className="text-gray-500 mt-2">เข้าสู่ระบบพนักงาน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกชื่อผู้ใช้งาน"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN (6 หลัก)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="pin"
                required
                maxLength={6}
                pattern="\d*"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              ลงทะเบียน
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
