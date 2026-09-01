'use client'
import { useTransition } from 'react'
import { login } from '@/app/actions/auth'
import { toast as sonnerToast } from 'sonner'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden font-sans selection:bg-red-500/30">
      
      {/* Epic Background Elements for Admin */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-red-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[35rem] h-[35rem] bg-rose-900/30 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00000a_1px,transparent_1px),linear-gradient(to_bottom,#ff00000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-tilt"></div>
        
        <div className="relative bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-red-500/30">
          
          <div className="text-center mb-10">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-950 to-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-500/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               <i className="fa-solid fa-shield-halved text-5xl text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"></i>
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200 tracking-wider uppercase">Control Center</h1>
            <p className="text-red-500/80 mt-2 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2">
               <i className="fa-solid fa-circle text-[6px] animate-pulse"></i> Admin Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-red-400/80 mb-2 uppercase tracking-widest">Admin Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user-astronaut text-slate-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-black/50 border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-white placeholder-slate-700 transition-all shadow-inner font-mono"
                  placeholder="SYSTEM_ADMIN"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-red-400/80 mb-2 uppercase tracking-widest">Access Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-key text-slate-500 group-focus-within:text-red-500 transition-colors"></i>
                </div>
                <input
                  type="password"
                  name="pin"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-black/50 border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-red-400 placeholder-slate-700 tracking-[0.5em] transition-all shadow-inner font-mono text-lg"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transform hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isPending ? (
                 <i className="fa-solid fa-spinner fa-spin-pulse text-xl"></i>
              ) : (
                <>
                  <i className="fa-solid fa-fingerprint mr-3 text-lg opacity-80"></i> Authenticate
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 flex items-center justify-center opacity-50">
             <i className="fa-solid fa-lock text-[10px] text-slate-400 mr-2"></i>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
