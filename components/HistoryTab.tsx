'use client'
import { useState, useEffect } from 'react'
import { getMyDeliveries, editDelivery } from '@/app/actions/deliveries'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import ShadcnModal from '@/components/ui/ShadcnModal'
import { toast as hotToast } from 'react-hot-toast'
import { toast as sonnerToast } from 'sonner'

export default function HistoryTab() {
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<any[]>([])

    // Edit Modal State
    const [editRecord, setEditRecord] = useState<any>(null)
    const [editCount, setEditCount] = useState<string>('')
    const [editRate, setEditRate] = useState<string>('')
    const [editReason, setEditReason] = useState<string>('')

    const fetchRecords = () => {
        setLoading(true)
        getMyDeliveries().then(res => {
            if (res.data) setRecords(res.data)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    const handleEditClick = (record: any) => {
        setEditRecord(record)
        setEditCount(record.quantity.toString())
        setEditRate(record.rate_per_piece.toString())
        setEditReason('')
    }

    const confirmEdit = () => {
        if (!editCount || !editRate || !editReason.trim()) {
            sonnerToast.error('กรุณากรอกข้อมูลและเหตุผลให้ครบถ้วน')
            return
        }

        const count = Number(editCount)
        const rate = Number(editRate)

        const savePromise = editDelivery(editRecord.id, count, rate, editReason).then(res => {
            if (res.error) throw new Error(res.error)
            return res
        })

        hotToast.promise(savePromise, {
            loading: 'กำลังบันทึกการแก้ไข...',
            success: 'บันทึกการแก้ไขแล้ว',
            error: (err) => err.message
        }).then(() => {
            setEditRecord(null)
            fetchRecords()
        }).catch(() => {})
    }

    if (loading) return <div className="flex justify-center p-12"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i></div>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">ประวัติการจัดส่งย้อนหลัง</h2>
            {records.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100">ยังไม่มีประวัติ</div>
            ) : (
                <div className="space-y-3">
                    {records.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group relative overflow-hidden transition-all hover:shadow-md">
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1 font-medium">
                                    <i className="fa-solid fa-calendar-days text-blue-500 mr-2"></i>
                                    {format(new Date(r.delivery_date), 'dd MMMM yyyy', { locale: th })}
                                </div>
                                <div className="flex items-center font-medium text-gray-700 text-sm mt-2">
                                    <i className="fa-solid fa-box text-gray-400 mr-2"></i>
                                    {r.quantity} ชิ้น 
                                    <span className="mx-2 text-gray-300">|</span> 
                                    <i className="fa-solid fa-coins text-gray-400 mr-1"></i>
                                    เรต ฿{r.rate_per_piece}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <div className="text-right bg-green-50 px-3 py-2 rounded-xl mb-2">
                                    <div className="text-[10px] text-green-600 font-bold mb-0.5 uppercase tracking-wider">รวมเงิน</div>
                                    <div className="font-black text-green-700">฿{(r.quantity * Number(r.rate_per_piece)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <button onClick={() => handleEditClick(r)} className="text-xs text-blue-500 font-bold hover:text-blue-700 transition-colors flex items-center px-2 py-1 bg-blue-50 rounded-lg">
                                    <i className="fa-solid fa-pen mr-1"></i> แจ้งแก้ไข
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ShadcnModal
                isOpen={!!editRecord}
                title="แก้ไขยอดจัดส่ง"
                confirmText="บันทึกการแก้ไข"
                cancelText="ยกเลิก"
                onConfirm={confirmEdit}
                onCancel={() => setEditRecord(null)}
            >
                <div className="text-left space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">จำนวนชิ้นใหม่</label>
                        <input type="number" className="w-full border p-2 rounded-lg" value={editCount} onChange={e => setEditCount(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">เรตราคาใหม่</label>
                        <input type="number" step="0.01" className="w-full border p-2 rounded-lg" value={editRate} onChange={e => setEditRate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">เหตุผลในการแก้ไข <span className="text-red-500">*</span></label>
                        <textarea className="w-full border p-2 rounded-lg" rows={2} placeholder="เช่น คีย์ผิด, ลืมใส่เศษ..." value={editReason} onChange={e => setEditReason(e.target.value)}></textarea>
                    </div>
                    <p className="text-xs text-red-500 mt-2">* การแก้ไขจะถูกบันทึกประวัติให้แอดมินทราบ</p>
                </div>
            </ShadcnModal>
        </div>
    )
}
