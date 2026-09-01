'use client'
import { useState, useEffect, useMemo } from 'react'
import { getMyDeliveries, editDelivery } from '@/app/actions/deliveries'
import { format, getMonth, getYear, getDate } from 'date-fns'
import { th } from 'date-fns/locale'
import ShadcnModal from '@/components/ui/ShadcnModal'
import { toast as hotToast } from 'react-hot-toast'
import { toast as sonnerToast } from 'sonner'

export default function SummaryTab() {
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<any[]>([])

    // Determine current month and period
    const today = new Date()
    const currentMonth = format(today, 'yyyy-MM')
    const currentPeriod = getDate(today) <= 15 ? 1 : 2

    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(currentPeriod as 1 | 2)

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

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const d = new Date(r.delivery_date)
            const recMonth = format(d, 'yyyy-MM')
            if (recMonth !== selectedMonth) return false
            const dd = getDate(d)
            if (selectedPeriod === 1 && dd > 15) return false
            if (selectedPeriod === 2 && dd <= 15) return false
            return true
        }).sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())
    }, [records, selectedMonth, selectedPeriod])

    const { totalItems, totalAmount } = useMemo(() => {
        return filteredRecords.reduce((acc, r) => {
            acc.totalItems += r.quantity
            acc.totalAmount += (r.quantity * Number(r.rate_per_piece))
            return acc
        }, { totalItems: 0, totalAmount: 0 })
    }, [filteredRecords])

    // Generate month options based on existing records + current month
    const monthOptions = useMemo(() => {
        const months = new Set<string>()
        months.add(currentMonth)
        records.forEach(r => {
            months.add(format(new Date(r.delivery_date), 'yyyy-MM'))
        })
        return Array.from(months).sort().reverse()
    }, [records, currentMonth])

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

    if (loading) return <div className="flex justify-center p-12"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div>

    return (
        <div className="space-y-4 pb-20 animate-in fade-in duration-500">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
                <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                    <i className="fa-solid fa-calendar-check text-indigo-500 mr-2"></i> เลือกรอบบิล
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 p-2.5 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            {monthOptions.map(m => {
                                const [yyyy, mm] = m.split('-')
                                const d = new Date(Number(yyyy), Number(mm) - 1, 1)
                                return <option key={m} value={m}>{format(d, 'MMMM yyyy', { locale: th })}</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <select 
                            value={selectedPeriod} 
                            onChange={e => setSelectedPeriod(Number(e.target.value) as 1 | 2)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 p-2.5 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value={1}>งวด 1 - 15</option>
                            <option value={2}>งวด 16 - สิ้นเดือน</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-[1.5rem] shadow-lg text-white">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="relative z-10 flex flex-col gap-3">
                    <h3 className="font-bold text-indigo-100 text-sm">ยอดรวมงวดที่เลือก</h3>
                    <div className="flex justify-between items-center text-sm border-b border-indigo-400/30 pb-3">
                        <span className="font-medium text-indigo-50">จำนวนพัสดุรวม:</span>
                        <span className="font-black text-xl bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">{totalItems} ชิ้น</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="font-medium text-indigo-50">ยอดเงินรวม:</span>
                        <span className="text-3xl font-black drop-shadow-md">฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Detail List */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">รายละเอียดการจัดส่ง</h3>
                {filteredRecords.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <i className="fa-solid fa-folder-open text-2xl mb-2 text-slate-300"></i>
                        <p className="text-sm font-medium">ไม่มีข้อมูลในรอบบิลนี้</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRecords.map(r => (
                            <div key={r.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group relative overflow-hidden transition-all hover:shadow-md">
                                <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full"></div>
                                <div className="pl-3">
                                    <div className="flex items-center text-xs text-slate-500 mb-1 font-bold">
                                        <i className="fa-solid fa-calendar-day text-indigo-400 mr-1.5"></i>
                                        {format(new Date(r.delivery_date), 'd MMM yy', { locale: th })}
                                    </div>
                                    <div className="flex items-center font-black text-slate-700 text-sm mt-1">
                                        <span className="text-indigo-600">{r.quantity}</span><span className="text-xs text-slate-400 ml-1 mr-2">ชิ้น</span>
                                        <span className="mx-1 text-slate-200">|</span> 
                                        <span className="text-xs text-slate-400 ml-2 mr-1">เรต</span><span>฿{r.rate_per_piece}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                        <div className="font-black text-emerald-600 text-sm">฿{(r.quantity * Number(r.rate_per_piece)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <button onClick={() => handleEditClick(r)} className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 transition-colors flex items-center px-2 py-1 bg-indigo-50 rounded-md">
                                        <i className="fa-solid fa-pen mr-1"></i> แจ้งแก้ไข
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                        <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนชิ้นใหม่</label>
                        <input type="number" className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={editCount} onChange={e => setEditCount(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">เรตราคาใหม่</label>
                        <input type="number" step="0.01" className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={editRate} onChange={e => setEditRate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">เหตุผลในการแก้ไข <span className="text-red-500">*</span></label>
                        <textarea className="w-full border p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none" rows={2} placeholder="เช่น คีย์ผิด, ลืมใส่เศษ..." value={editReason} onChange={e => setEditReason(e.target.value)}></textarea>
                    </div>
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs font-medium flex gap-2">
                        <i className="fa-solid fa-circle-info mt-0.5"></i>
                        <span>การแก้ไขจะถูกบันทึกประวัติ และแจ้งเตือนให้แอดมินทราบเพื่อตรวจสอบความถูกต้อง</span>
                    </div>
                </div>
            </ShadcnModal>
        </div>
    )
}
