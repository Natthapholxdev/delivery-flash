'use client'
import { useState, useEffect, useTransition } from 'react'
import { getProfiles, saveKioskDeliveries, checkExistingDelivery } from '@/app/actions/admin'
import { toast as hotToast } from 'react-hot-toast'
import { toast as sonnerToast } from 'sonner'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export default function KioskTab() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState('')
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
        const [quantity, setQuantity] = useState<number | ''>('')
    const [rate, setRate] = useState<number | ''>('')
    const [existingRecord, setExistingRecord] = useState<{quantity: number, rate_per_piece: number} | null>(null)
    const [isChecking, setIsChecking] = useState(false)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        getProfiles().then(res => {
            if (res.data) setProfiles(res.data.filter(p => p.role === 'user' && p.status === 'approved'))
        })
    }, [])

    useEffect(() => {
        if (!selectedUser || !date) {
            setExistingRecord(null)
            return
        }
        setIsChecking(true)
        checkExistingDelivery(selectedUser, date).then(res => {
            setIsChecking(false)
            if (res?.data) {
                setExistingRecord(res.data)
            } else {
                setExistingRecord(null)
            }
        })
    }, [selectedUser, date])

    const handleSave = () => {
        if (!selectedUser || !quantity || !rate) {
            sonnerToast.error('à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸šà¸–à¹‰à¸§à¸™')
            return
        }

        startTransition(async () => {
            const payload = [{ count: Number(quantity), rate: Number(rate) }]
            
            const savePromise = saveKioskDeliveries(selectedUser, payload, date).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(savePromise, {
                loading: 'à¸à¸³à¸¥à¸±à¸‡à¸šà¸±à¸™à¸—à¸¶à¸...',
                success: 'à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹à¸—à¸™à¸žà¸™à¸±à¸à¸‡à¸²à¸™à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢',
                error: (err) => err.message
            }).then(() => {
                setQuantity('')
                setRate('')
            }).catch(() => {})
        })
    }

    return (
        <div className="max-w-xl bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Kiosk Mode (à¸„à¸µà¸¢à¹Œà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹à¸—à¸™à¸žà¸™à¸±à¸à¸‡à¸²à¸™)</h2>
            
                        <div className="space-y-5">
                {existingRecord && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 animate-in slide-in-from-top-2">
                        <div className="flex items-start">
                            <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5 mr-3 text-lg"></i>
                            <div>
                                <h4 className="font-bold">พนักงานบันทึกข้อมูลของวันนี้แล้ว!</h4>
                                <p className="text-sm mt-1">มียอดบันทึกเดิมอยู่: <strong>{existingRecord.quantity} ชิ้น</strong> (เรต {existingRecord.rate_per_piece} บ.)</p>
                                <p className="text-xs text-amber-600 mt-2">หากบันทึกใหม่ ยอดใหม่นี้จะไป <strong>บวกเพิ่ม</strong> หรือ <strong>ทับข้อมูลเก่า</strong> ขึ้นอยู่กับระบบ กรุณาตรวจสอบให้แน่ใจ</p>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">à¹€à¸¥à¸·à¸­à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™</label>
                    <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full border-gray-300 border p-3 rounded-xl focus:ring-red-500 focus:border-red-500">
                        <option value="">-- à¹€à¸¥à¸·à¸­à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™ --</option>
                        {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.username}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">à¸§à¸±à¸™à¸—à¸µà¹ˆà¸ˆà¸±à¸”à¸ªà¹ˆà¸‡</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border-gray-300 border p-3 rounded-xl focus:ring-red-500 focus:border-red-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">à¸ˆà¸³à¸™à¸§à¸™à¸žà¸±à¸ªà¸”à¸¸ (à¸Šà¸´à¹‰à¸™)</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')} className="w-full border-gray-300 border p-3 rounded-xl focus:ring-red-500 focus:border-red-500" placeholder="à¹€à¸Šà¹ˆà¸™ 50" min={1} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">à¸£à¸²à¸„à¸²à¸•à¹ˆà¸­à¸Šà¸´à¹‰à¸™ (à¸šà¸²à¸—)</label>
                        <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value ? Number(e.target.value) : '')} className="w-full border-gray-300 border p-3 rounded-xl focus:ring-red-500 focus:border-red-500" placeholder="à¹€à¸Šà¹ˆà¸™ 6.5" min={0.1} />
                    </div>
                </div>

                <button onClick={handleSave} disabled={isPending} className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-200">
                    {isPending && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                    à¸šà¸±à¸™à¸—à¸¶à¸à¸¢à¸­à¸”à¹€à¸‚à¹‰à¸²à¸£à¸°à¸šà¸š
                </button>
            </div>
        </div>
    )
}

