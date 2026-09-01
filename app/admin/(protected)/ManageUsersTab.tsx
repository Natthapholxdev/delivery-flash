'use client'
import { useState, useEffect, useTransition } from 'react'
import { getProfiles, toggleUserStatus, addEmployeeByAdmin } from '@/app/actions/admin'
import { toast as hotToast } from 'react-hot-toast'
import { notistackToast } from '@/components/ui/CustomToasts'

export default function ManageUsersTab() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    
    const [showAddForm, setShowAddForm] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [newPin, setNewPin] = useState('')

    const fetchProfiles = async () => {
        const res = await getProfiles()
        if (res.data) setProfiles(res.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    const handleToggle = (id: string, status: string) => {
        startTransition(async () => {
            const promise = toggleUserStatus(id, status).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(promise, {
                loading: 'กำลังอัปเดตสถานะ...',
                success: 'อัปเดตสถานะเรียบร้อย',
                error: (err) => err.message
            })

            await promise.catch(() => {})
            fetchProfiles()
        })
    }

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const promise = addEmployeeByAdmin(newUsername, newPin).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(promise, {
                loading: 'กำลังสร้างพนักงานใหม่...',
                success: 'เพิ่มพนักงานเรียบร้อยแล้ว',
                error: (err) => err.message
            })

            try {
                await promise
                setNewUsername('')
                setNewPin('')
                setShowAddForm(false)
                fetchProfiles()
            } catch (err) {}
        })
    }

    if (loading) return <div className="flex justify-center p-12"><i className="fa-solid fa-circle-notch fa-spin text-red-600 text-3xl"></i></div>

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">จัดการสิทธิ์พนักงาน</h2>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                    <i className="fa-solid fa-user-plus mr-2"></i>
                    เพิ่มพนักงานใหม่
                </button>
            </div>

            {showAddForm && (
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-auto flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full border-gray-300 border p-2.5 rounded-xl focus:ring-red-500 focus:border-red-500" placeholder="ชื่อผู้ใช้" />
                        </div>
                        <div className="w-full sm:w-auto flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">PIN (6 หลัก)</label>
                            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} required minLength={6} maxLength={6} pattern="\d*" className="w-full border-gray-300 border p-2.5 rounded-xl focus:ring-red-500 focus:border-red-500" placeholder="รหัส PIN 6 หลัก" />
                        </div>
                        <button type="submit" disabled={isPending} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-70 flex items-center justify-center">
                            {isPending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'บันทึก'}
                        </button>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm">
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {profiles.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{p.username}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{p.role.toUpperCase()}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status.toUpperCase()}</span>
                                </td>
                                <td className="p-4 text-right">
                                    {p.role !== 'admin' && (
                                        <button 
                                            disabled={isPending}
                                            onClick={() => handleToggle(p.id, p.status)}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p.status === 'approved' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {p.status === 'approved' ? <><i className="fa-solid fa-user-xmark mr-1.5"></i> ระงับ</> : <><i className="fa-solid fa-user-check mr-1.5"></i> อนุมัติ</>}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
