'use client'
import { useTransition } from 'react'
import { register } from '@/app/actions/auth'
import { User, KeyRound, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) {
        toast.error('ลงทะเบียนไม่สำเร็จ', {
            description: result.error,
        })
      } else if (result?.success) {
        toast.success('ลงทะเบียนเรียบร้อยแล้ว!', {
            description: 'รอผู้ดูแลระบบอนุมัติบัญชีของคุณ',
            duration: 5000,
        })
        router.push('/login')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ลงทะเบียนพนักงาน</h1>
          <p className="text-gray-500 mt-2">สร้างบัญชีเพื่อใช้งาน Delivery Tracking</p>
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
                placeholder="ตั้งชื่อผู้ใช้งาน"
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
                minLength={6}
                maxLength={6}
                pattern="\d*"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="ตั้งรหัส PIN 6 หลัก"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'ลงทะเบียน'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
