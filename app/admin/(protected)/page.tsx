'use client'
import { useState } from 'react'
import ManageUsersTab from './ManageUsersTab'
import KioskTab from './KioskTab'
import SystemHistoryTab from './SystemHistoryTab'
import DashboardTab from './DashboardTab'
import { logout } from '@/app/actions/auth'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('home')

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-red-500/30 pb-28 md:pb-0 md:flex">
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex bg-[#1e293b]/80 backdrop-blur-xl border-r border-slate-800/60 w-72 flex-shrink-0 flex-col min-h-screen sticky top-0 z-20 shadow-2xl">
                <div className="p-6 bg-[#0f172a]/50 flex items-center gap-3 border-b border-slate-800/60">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/20">
                        <i className="fa-solid fa-shield-halved text-white text-lg drop-shadow-md"></i>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Admin Portal</h1>
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center">
                            <i className="fa-solid fa-circle text-[6px] mr-1 animate-pulse"></i> Control Center
                        </p>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                    <button onClick={() => setActiveTab('home')} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === 'home' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                        {activeTab === 'home' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-50"></div>}
                        <i className={`fa-solid fa-house text-lg w-8 transition-transform group-hover:scale-110 ${activeTab === 'home' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'}`}></i>
                        <span className={`font-bold tracking-wide ${activeTab === 'home' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>หน้าหลัก</span>
                    </button>
                    <button onClick={() => setActiveTab('dashboard')} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === 'dashboard' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                        {activeTab === 'dashboard' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-50"></div>}
                        <i className={`fa-solid fa-chart-pie text-lg w-8 transition-transform group-hover:scale-110 ${activeTab === 'dashboard' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'}`}></i>
                        <span className={`font-bold tracking-wide ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>สถิติ (Dashboard)</span>
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === 'history' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                        {activeTab === 'history' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-50"></div>}
                        <i className={`fa-solid fa-database text-lg w-8 transition-transform group-hover:scale-110 ${activeTab === 'history' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'}`}></i>
                        <span className={`font-bold tracking-wide ${activeTab === 'history' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>ประวัติระบบรวม</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === 'users' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                        {activeTab === 'users' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-50"></div>}
                        <i className={`fa-solid fa-users text-lg w-8 transition-transform group-hover:scale-110 ${activeTab === 'users' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'}`}></i>
                        <span className={`font-bold tracking-wide ${activeTab === 'users' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>จัดการพนักงาน</span>
                    </button>
                    <button onClick={() => setActiveTab('kiosk')} className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === 'kiosk' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                        {activeTab === 'kiosk' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-50"></div>}
                        <i className={`fa-solid fa-mobile-screen-button text-lg w-8 transition-transform group-hover:scale-110 ${activeTab === 'kiosk' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'}`}></i>
                        <span className={`font-bold tracking-wide ${activeTab === 'kiosk' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>Kiosk Mode</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800/60">
                    <button onClick={() => logout()} className="flex items-center px-4 py-3 w-full rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group">
                        <i className="fa-solid fa-power-off text-lg w-8 transition-transform group-hover:scale-110"></i>
                        <span className="font-bold tracking-wide">ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
            
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative min-h-screen">
                {/* Background decorative elements */}
                <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="fixed bottom-[-10%] left-[20%] w-[30rem] h-[30rem] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/20">
                            <i className="fa-solid fa-shield-halved text-white text-lg drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Admin Portal</h1>
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center">
                                <i className="fa-solid fa-circle text-[6px] mr-1 animate-pulse"></i> Control Center
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {activeTab === 'home' && (
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4">
                            <button onClick={() => setActiveTab('dashboard')} className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-[#1e293b] hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/20 group">
                                <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-chart-pie"></i>
                                </div>
                                <h3 className="font-bold text-slate-200">สถิติระบบ</h3>
                            </button>
                            <button onClick={() => setActiveTab('history')} className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-[#1e293b] hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/20 group">
                                <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-database"></i>
                                </div>
                                <h3 className="font-bold text-slate-200">ประวัติรวม</h3>
                            </button>
                            <button onClick={() => setActiveTab('users')} className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-[#1e293b] hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/20 group">
                                <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <h3 className="font-bold text-slate-200">พนักงาน</h3>
                            </button>
                            <button onClick={() => setActiveTab('kiosk')} className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-[#1e293b] hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/20 group">
                                <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-mobile-screen-button"></i>
                                </div>
                                <h3 className="font-bold text-slate-200">Kiosk</h3>
                            </button>
                        </div>
                    )}

                    {activeTab !== 'home' && (
                        <div className="bg-slate-50 text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200/50 p-4 sm:p-6 min-h-[70vh]">
                            {activeTab === 'users' && <ManageUsersTab />}
                            {activeTab === 'kiosk' && <KioskTab />}
                            {activeTab === 'history' && <SystemHistoryTab />}
                            {activeTab === 'dashboard' && <DashboardTab />}
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 p-2 flex justify-around items-center">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${activeTab === 'home' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-slate-200'}`}>
                        <i className="fa-solid fa-house text-xl mb-1"></i>
                        <span className="text-[10px] font-bold">โฮม</span>
                    </button>
                    <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-slate-200'}`}>
                        <i className="fa-solid fa-chart-pie text-xl mb-1"></i>
                        <span className="text-[10px] font-bold">สถิติ</span>
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${activeTab === 'history' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-slate-200'}`}>
                        <i className="fa-solid fa-database text-xl mb-1"></i>
                        <span className="text-[10px] font-bold">ประวัติ</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${activeTab === 'users' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-slate-200'}`}>
                        <i className="fa-solid fa-users text-xl mb-1"></i>
                        <span className="text-[10px] font-bold">พนักงาน</span>
                    </button>
                    <button onClick={() => logout()} className="flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all text-slate-400 hover:text-red-400">
                        <i className="fa-solid fa-power-off text-xl mb-1"></i>
                        <span className="text-[10px] font-bold">ออก</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
