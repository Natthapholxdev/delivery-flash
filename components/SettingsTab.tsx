'use client'
import { useState, useTransition } from 'react'
import { changeUserPin } from '@/app/actions/user'
import { toast as hotToast } from 'react-hot-toast'
import { toast as toastify } from 'react-toastify'

export default function SettingsTab({ currentTheme = 'red', onThemeChange }: { currentTheme?: string, onThemeChange?: (theme: string) => void }) {
    const [currentPin, setCurrentPin] = useState('')
    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [isPending, startTransition] = useTransition()

    const themeOptions = [
        { id: 'white', name: 'Clean White', color: 'bg-white border-gray-300' },
        { id: 'black', name: 'Pure Black', color: 'bg-black border-gray-700' },
        { id: 'red', name: 'Cyber Red', color: 'bg-red-500' },
        { id: 'blue', name: 'Neon Blue', color: 'bg-blue-500' },
        { id: 'green', name: 'Matrix Green', color: 'bg-emerald-500' },
        { id: 'purple', name: 'Cosmic Purple', color: 'bg-purple-500' },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newPin !== confirmPin) {
            toastify.error('รหัส PIN ใหม่ไม่ตรงกัน')
            return
        }

        startTransition(async () => {
            const promise = changeUserPin(currentPin, newPin).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(promise, {
                loading: 'กำลังเปลี่ยนรหัสผ่าน...',
                success: 'เปลี่ยนรหัส PIN เรียบร้อยแล้ว',
                error: (err) => err.message
            })

            try {
                await promise
                setCurrentPin('')
                setNewPin('')
                setConfirmPin('')
            } catch (err) {}
        })
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">ตั้งค่าบัญชี</h2>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fa-solid fa-palette text-pink-500 mr-2 text-lg"></i>
                    ธีมสีแอปพลิเคชัน
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {themeOptions.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => {
                                onThemeChange?.(t.id)
                                toastify.success(`เปลี่ยนธีมเป็น ${t.name}`, { autoClose: 2000, position: 'bottom-center' })
                            }}
                            className={`flex items-center p-3 rounded-xl border-2 transition-all ${currentTheme === t.id ? 'border-gray-800 bg-gray-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-300'}`}
                            type="button"
                        >
                            <div className={`w-6 h-6 rounded-full ${t.color} mr-3 shadow-inner border border-white/20`}></div>
                            <span className="font-medium text-sm text-gray-700">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fa-solid fa-key text-blue-600 mr-2 text-lg"></i>
                    เปลี่ยนรหัสผ่าน (PIN)
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN ปัจจุบัน</label>
                        <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} required maxLength={6} pattern="\d*" className="w-full border-gray-300 border p-2.5 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN ใหม่ (6 หลัก)</label>
                        <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} required minLength={6} maxLength={6} pattern="\d*" className="w-full border-gray-300 border p-2.5 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยัน PIN ใหม่</label>
                        <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} required minLength={6} maxLength={6} pattern="\d*" className="w-full border-gray-300 border p-2.5 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="••••••" />
                    </div>
                    
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-colors disabled:opacity-70 mt-2">
                        {isPending && <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>}
                        เปลี่ยนรหัส PIN
                    </button>
                </form>
            </div>
        </div>
    )
}
