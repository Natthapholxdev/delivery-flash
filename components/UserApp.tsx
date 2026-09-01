'use client'
import { useState, useEffect } from 'react'
import TrackerTab from './TrackerTab'
import SummaryTab from './SummaryTab'
import HistoryTab from './HistoryTab'
import SettingsTab from './SettingsTab'
import { logout } from '@/app/actions/auth'

type ThemeConfig = {
    id: string;
    type: 'dark' | 'light';
    bgMain: string;
    bgHeader: string;
    bgNav: string;
    headerIconGrad: string;
    headerIconShadow: string;
    headerIconBorder: string;
    pulseDot: string;
    homeActiveGrad: string;
    homeActiveText: string;
}

const themes: Record<string, ThemeConfig> = {
    'red': {
        id: 'red', type: 'dark',
        bgMain: 'bg-[#0f172a]', bgHeader: 'bg-[#0f172a]/70', bgNav: 'bg-[#1e293b]/90',
        headerIconGrad: 'from-red-500 to-orange-600', headerIconShadow: 'shadow-red-500/20', headerIconBorder: 'border-red-400/20',
        pulseDot: 'text-red-400', homeActiveGrad: 'bg-red-500/50', homeActiveText: 'text-white drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]'
    },
    'blue': {
        id: 'blue', type: 'dark',
        bgMain: 'bg-[#0a0f24]', bgHeader: 'bg-[#0a0f24]/70', bgNav: 'bg-[#141b33]/90',
        headerIconGrad: 'from-blue-500 to-cyan-600', headerIconShadow: 'shadow-blue-500/20', headerIconBorder: 'border-blue-400/20',
        pulseDot: 'text-cyan-400', homeActiveGrad: 'bg-blue-500/50', homeActiveText: 'text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
    },
    'green': {
        id: 'green', type: 'dark',
        bgMain: 'bg-[#05170e]', bgHeader: 'bg-[#05170e]/70', bgNav: 'bg-[#0a2416]/90',
        headerIconGrad: 'from-emerald-500 to-teal-600', headerIconShadow: 'shadow-emerald-500/20', headerIconBorder: 'border-emerald-400/20',
        pulseDot: 'text-emerald-400', homeActiveGrad: 'bg-emerald-500/50', homeActiveText: 'text-white drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
    },
    'purple': {
        id: 'purple', type: 'dark',
        bgMain: 'bg-[#170a24]', bgHeader: 'bg-[#170a24]/70', bgNav: 'bg-[#251433]/90',
        headerIconGrad: 'from-purple-500 to-fuchsia-600', headerIconShadow: 'shadow-purple-500/20', headerIconBorder: 'border-purple-400/20',
        pulseDot: 'text-fuchsia-400', homeActiveGrad: 'bg-purple-500/50', homeActiveText: 'text-white drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]'
    },
    'white': {
        id: 'white', type: 'light',
        bgMain: 'bg-slate-50', bgHeader: 'bg-white/70', bgNav: 'bg-white/90',
        headerIconGrad: 'from-slate-200 to-slate-400', headerIconShadow: 'shadow-slate-300/20', headerIconBorder: 'border-slate-300/50',
        pulseDot: 'text-emerald-500', homeActiveGrad: 'bg-slate-200/80', homeActiveText: 'text-slate-900'
    },
    'black': {
        id: 'black', type: 'dark',
        bgMain: 'bg-black', bgHeader: 'bg-black/70', bgNav: 'bg-[#111]/90',
        headerIconGrad: 'from-gray-700 to-gray-900', headerIconShadow: 'shadow-gray-700/20', headerIconBorder: 'border-gray-600/20',
        pulseDot: 'text-white', homeActiveGrad: 'bg-gray-700/50', homeActiveText: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
    }
}

export default function UserApp({ username }: { username: string }) {
    const [activeTab, setActiveTab] = useState('home')
    const [theme, setTheme] = useState('red')

    useEffect(() => {
        const saved = localStorage.getItem('dtracker_theme')
        if (saved && themes[saved]) setTheme(saved)
    }, [])

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme)
        localStorage.setItem('dtracker_theme', newTheme)
    }

    const t = themes[theme] || themes['red']
    const isLight = t.type === 'light'

    const menuItems = [
        { id: 'tracker', label: 'บันทึก', icon: 'fa-solid fa-box-open', color: 'from-orange-500 to-red-500', glow: 'shadow-red-500/40', accent: 'text-red-500' },
        { id: 'summary', label: 'สรุปผล', icon: 'fa-solid fa-chart-pie', color: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/40', accent: 'text-blue-500' },
        { id: 'history', label: 'ประวัติ', icon: 'fa-solid fa-clock-rotate-left', color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/40', accent: 'text-emerald-500' },
        { id: 'settings', label: 'ตั้งค่า', icon: 'fa-solid fa-gear', color: 'from-slate-500 to-gray-600', glow: 'shadow-slate-500/40', accent: 'text-slate-500' }
    ]

    return (
        <div className={`flex flex-col min-h-screen ${t.bgMain} ${isLight ? 'text-slate-900' : 'text-slate-100'} font-sans pb-28 transition-colors duration-500 overflow-x-hidden`}>
            {/* Header */}
            <header className={`sticky top-0 z-20 backdrop-blur-xl ${t.bgHeader} border-b ${isLight ? 'border-slate-200/80' : 'border-slate-800/60'} p-4 transition-colors duration-500`}>
                <div className="flex justify-between items-center max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.headerIconGrad} flex items-center justify-center shadow-lg ${t.headerIconShadow} border ${t.headerIconBorder} transition-all duration-500`}>
                            <i className={`fa-solid fa-truck-fast text-xl ${isLight ? 'text-slate-700' : 'text-white'}`}></i>
                        </div>
                        <div>
                            <h1 className={`font-bold text-lg tracking-wide leading-tight bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-slate-800 to-slate-500' : 'from-white to-slate-400'}`}>Flash Express</h1>
                            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium uppercase tracking-widest`}><i className={`fa-solid fa-circle text-[8px] ${t.pulseDot} mr-1 animate-pulse transition-colors duration-500`}></i> {username}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button type="submit" className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border ${isLight ? 'bg-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 border-slate-200' : 'bg-slate-800/50 text-slate-300 hover:text-red-400 hover:bg-red-500/20 border-slate-700/50'}`}>
                            <i className="fa-solid fa-power-off"></i>
                        </button>
                    </form>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 max-w-lg mx-auto w-full relative z-10 flex flex-col">
                {activeTab === 'home' && (
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 text-center sm:text-left">
                            <h2 className={`text-3xl font-extrabold ${isLight ? 'text-slate-800' : 'text-white'} mb-2 tracking-tight`}>เลือกเมนูทำงาน</h2>
                            <p className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-sm`}>ระบบบันทึกยอดจัดส่งพัสดุสำหรับพนักงาน</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 sm:gap-5">
                            {menuItems.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => setActiveTab(item.id)}
                                    className={`relative overflow-hidden group flex flex-col items-center justify-center p-6 rounded-3xl ${isLight ? 'bg-white border-slate-200/60 shadow-lg' : 'bg-slate-800/40 border-slate-700/50 shadow-xl'} backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 ${item.glow}`}
                                >
                                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color} transition-opacity group-hover:opacity-20`}></div>
                                    <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br ${item.color} ${isLight ? 'shadow-black/10 border-black/5' : 'shadow-black/30 border-white/10'} relative`}>
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <i className={`${item.icon} text-3xl text-white drop-shadow-md`}></i>
                                    </div>
                                    <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'} tracking-wide`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Embedded White Card for Legacy Tabs */}
                <div className={activeTab !== 'home' ? 'block animate-in fade-in zoom-in-95 duration-300' : 'hidden'}>
                    <div className="bg-slate-50 text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200/50 p-2 sm:p-4 min-h-[60vh]">
                        <div className="flex justify-between items-center mb-4 px-2 pt-2">
                            <button onClick={() => setActiveTab('home')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                                <i className="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <span className="font-bold text-slate-700 tracking-wide uppercase text-xs">{menuItems.find(m => m.id === activeTab)?.label}</span>
                            <div className="w-8"></div>
                        </div>
                        {activeTab === 'tracker' && <TrackerTab />}
                        {activeTab === 'summary' && <SummaryTab />}
                        {activeTab === 'history' && <HistoryTab />}
                        {activeTab === 'settings' && <SettingsTab currentTheme={theme} onThemeChange={handleThemeChange} />}
                    </div>
                </div>
            </main>

            {/* High-tech Floating Bottom Navigation */}
            <nav className="fixed bottom-6 left-0 right-0 z-30 pointer-events-none px-4">
                <div className="max-w-md mx-auto flex justify-center pointer-events-auto">
                    <div className={`flex items-center justify-between w-full ${t.bgNav} backdrop-blur-xl border p-2 rounded-[2rem] transition-colors duration-500 ${isLight ? 'border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]' : 'border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] shadow-black'}`}>
                        
                        <button onClick={() => setActiveTab('home')} className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${activeTab === 'home' ? (isLight ? 'text-slate-800' : 'text-white') : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}>
                            {activeTab === 'home' && <div className={`absolute inset-1 ${t.homeActiveGrad} rounded-full border ${isLight ? 'border-slate-300/50' : 'border-white/10'} shadow-inner transition-colors duration-500`}></div>}
                            <i className={`fa-solid fa-house text-xl z-10 transition-transform ${activeTab === 'home' ? `-translate-y-1 ${t.homeActiveText}` : ''}`}></i>
                            <span className={`text-[10px] font-bold tracking-wide z-10 mt-1 ${activeTab === 'home' ? (isLight ? 'text-slate-700' : 'text-white/90') : ''}`}>หน้าแรก</span>
                        </button>
                        
                        {menuItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)} 
                                className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${activeTab === item.id ? (isLight ? 'text-slate-800' : 'text-white') : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
                            >
                                {activeTab === item.id && (
                                    <div className={`absolute inset-1 bg-gradient-to-br ${item.color} rounded-full opacity-15 border border-white/10 shadow-inner`}></div>
                                )}
                                <i className={`${item.icon} text-xl z-10 transition-transform ${activeTab === item.id ? `-translate-y-1 ${item.accent} drop-shadow-[0_0_8px_currentColor]` : ''}`}></i>
                                <span className={`text-[10px] font-bold tracking-wide z-10 mt-1 ${activeTab === item.id ? item.accent : ''}`}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}
