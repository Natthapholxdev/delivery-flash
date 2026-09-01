'use client'
import { useTransition } from 'react'
import { login } from '@/app/actions/auth'
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Epic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[35rem] h-[35rem] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '5s' }}></div>
      <div className="absolute top-[40%] right-[20%] w-[15rem] h-[15rem] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-tilt"></div>
        
        <div className="relative bg-[#1e293b]/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-700/50">
          
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-slate-700/50 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl"></div>
               <i className="fa-solid fa-bolt text-4xl text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-600 drop-shadow-md"></i>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Flash Delivery</h1>
            <p className="text-slate-400 mt-2 font-medium text-sm uppercase tracking-widest">Driver Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white placeholder-slate-600 transition-all shadow-inner"
                  placeholder="กรอกรหัสพนักงาน"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Security PIN</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                </div>
                <input
                  type="password"
                  name="pin"
                  required
                  maxLength={6}
                  pattern="\d*"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white placeholder-slate-600 tracking-[0.5em] transition-all shadow-inner"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e293b] focus:ring-orange-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transform hover:-translate-y-0.5"
            >
              {isPending ? (
                 <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
              ) : (
                <>
                  เข้าสู่ระบบ <i className="fa-solid fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <Link href="/register" className="font-bold text-orange-400 hover:text-orange-300 transition-colors hover:underline underline-offset-4">
                สมัครสมาชิกเลย
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
