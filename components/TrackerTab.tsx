'use client'
import { useState, useTransition, useMemo } from 'react'
import { saveDeliveries } from '@/app/actions/deliveries'
import { format } from 'date-fns'

// Import modern toasts
import { toast as toastify } from 'react-toastify'
import { toast as hotToast } from 'react-hot-toast'
import ShadcnModal from '@/components/ui/ShadcnModal'
import { notistackToast, mantineToast } from '@/components/ui/CustomToasts'

type RateItem = {
    id: string;
    rate: number;
    count: number;
}

const COMMON_RATES = [6.75, 7.00, 8.75, 9.00]
const OTHER_RATES = [15, 12, 10, 8, 6.5, 6, 5.5, 5, 4.5, 4, 3, 2, 1]

export default function TrackerTab() {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [totalStr, setTotalStr] = useState('')
    const [isConfirmedTotal, setIsConfirmedTotal] = useState(false)
    const [items, setItems] = useState<RateItem[]>([])
    
    const [selectedOtherRate, setSelectedOtherRate] = useState<string>("")
    const [isPending, startTransition] = useTransition()

    // Modal States
    const [showConfirmTotalModal, setShowConfirmTotalModal] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)

    const targetTotal = Number(totalStr) || 0
    
    const currentTotalCount = useMemo(() => {
        return items.reduce((sum, item) => sum + item.count, 0)
    }, [items])
    
    const currentTotalMoney = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.count * item.rate), 0)
    }, [items])

    const handleConfirmTotalClick = () => {
        if (targetTotal <= 0 || targetTotal > 5000) {
            toastify.warn('กรุณาระบุจำนวนพัสดุให้ถูกต้อง (1-5000)') // Toastify Top-Right Progress Bar
            return
        }
        setShowConfirmTotalModal(true)
    }

    const confirmTotal = () => {
        setShowConfirmTotalModal(false)
        setIsConfirmedTotal(true)
        setItems([{ id: Date.now().toString(), rate: 6.75, count: 0 }])
        mantineToast('พร้อมกรอกยอด', 'คุณสามารถกดที่ปุ่มราคาและเพิ่มจำนวนชิ้นได้เลย', 'info') // Mantine style
    }

    const addRateItem = (rate: number) => {
        if (items.some(it => it.rate === rate)) return;
        setItems(prev => [...prev, { id: Date.now().toString(), rate, count: 0 }])
    }

    const [isCounting, setIsCounting] = useState(false)

    const updateItemCount = (id: string, delta: number) => {
        if (isCounting) return;
        setIsCounting(true)
        setTimeout(() => setIsCounting(false), 150)

        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newCount = Math.max(0, item.count + delta)
                return { ...item, count: newCount }
            }
            return item
        }))
        
        // Show subtle notistack style on rapid click (throttled to not spam)
        if (Math.random() > 0.8) {
            notistackToast(`อัปเดตจำนวนแล้ว`, 'default')
        }
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(it => it.id !== id))
    }

    const handleSaveClick = () => {
        if (currentTotalCount !== targetTotal) {
            toastify.error(`ยอดรวมชิ้นงาน (${currentTotalCount}) ไม่ตรงกับยอดเป้าหมาย (${targetTotal})`)
            return
        }

        const finalItems = items.filter(it => it.count > 0)
        
        if (finalItems.length === 0) {
            toastify.error('กรุณาระบุจำนวนชิ้นอย่างน้อย 1 รายการ')
            return
        }

        setShowSaveModal(true)
    }

    const confirmSave = () => {
        setShowSaveModal(false)
        
        const finalItems = items.filter(it => it.count > 0)
        const payload = finalItems.map(it => ({
            rate: it.rate,
            count: it.count
        }))

        startTransition(async () => {
            // Hot Toast Promise style
            const savePromise = saveDeliveries(payload, date)
            
            hotToast.promise(savePromise, {
                loading: 'กำลังบันทึกข้อมูล...',
                success: 'บันทึกยอดจัดส่งเรียบร้อย!',
                error: 'เกิดข้อผิดพลาดในการบันทึก'
            })

            const res = await savePromise
            if (!res.error) {
                setTotalStr('')
                setIsConfirmedTotal(false)
                setItems([])
            }
        })
    }

    if (!isConfirmedTotal) {
        return (
            <>
                <div className="flex flex-col h-full justify-center p-2 sm:p-4 mt-8 sm:mt-0">
                    <div className="relative group max-w-sm mx-auto w-full animate-in fade-in zoom-in duration-500">
                        {/* Premium Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                        
                        <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2rem] p-8 border border-white/50">
                            {/* Animated icon box */}
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-[inset_0_2px_10px_rgba(255,255,255,1),0_10px_20px_-10px_rgba(79,70,229,0.3)] border border-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                                <i className="fa-solid fa-box-open text-4xl text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 drop-shadow-sm"></i>
                            </div>
                            
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 text-center mb-2 tracking-tight">ตั้งยอดวันนี้</h2>
                            <p className="text-slate-500 text-center text-sm mb-8 font-medium">ระบุจำนวนพัสดุทั้งหมดที่คุณจัดส่ง</p>
                            
                            <div className="space-y-6">
                                <div className="relative">
                                    <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10 rounded-full">วันที่จัดส่ง</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700 transition-all shadow-inner" />
                                </div>
                                
                                <div className="relative">
                                    <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10 rounded-full">เป้าหมาย (ชิ้น)</label>
                                    <div className="relative flex items-center">
                                        <input type="number" value={totalStr} onChange={e => setTotalStr(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-4xl text-slate-800 text-center transition-all shadow-inner placeholder:text-slate-300" placeholder="0" pattern="\d*" />
                                        <span className="absolute right-6 text-slate-400 font-bold">ชิ้น</span>
                                    </div>
                                </div>

                                <button onClick={handleConfirmTotalClick} disabled={!totalStr || Number(totalStr) <= 0} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.8)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group/btn">
                                    เริ่มบันทึกยอด <i className="fa-solid fa-arrow-right ml-3 transition-transform group-hover/btn:translate-x-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ShadcnModal
                    isOpen={showConfirmTotalModal}
                    title="ยืนยันยอดจัดส่ง?"
                    description={`คุณมียอดจัดส่งทั้งหมด ${targetTotal} ชิ้น ใช่หรือไม่?`}
                    confirmText="ใช่, ถูกต้อง!"
                    cancelText="ยกเลิก"
                    onConfirm={confirmTotal}
                    onCancel={() => setShowConfirmTotalModal(false)}
                />
            </>
        )
    }

    return (
        <>
            <div className="flex flex-col relative animate-in fade-in zoom-in-95 duration-500 min-h-[60vh]">
                {/* Floating Header Card */}
                <div className="sticky top-0 z-30 mx-1 mb-6 pt-2">
                    <div className="absolute inset-0 top-2 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-[2rem] blur-xl"></div>
                    <div className="relative bg-white/85 backdrop-blur-2xl border border-white shadow-xl rounded-[1.5rem] p-5">
                        <div className="flex justify-between items-start mb-3">
                            <button onClick={() => setIsConfirmedTotal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all shadow-sm backdrop-blur-md">
                                <i className="fa-solid fa-arrow-left text-sm"></i>
                            </button>
                            <div className="text-center">
                                <span className="block text-[10px] font-bold tracking-widest text-indigo-500 uppercase mb-0.5">สถานะปัจจุบัน</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className={`text-4xl font-black tracking-tighter ${currentTotalCount === targetTotal ? 'text-emerald-500 drop-shadow-sm' : currentTotalCount > targetTotal ? 'text-red-500 drop-shadow-sm' : 'text-slate-800'}`}>
                                        {currentTotalCount}
                                    </span>
                                    <span className="text-slate-400 font-bold text-lg">/ {targetTotal}</span>
                                </div>
                            </div>
                            <div className="w-8"></div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200/60">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${currentTotalCount === targetTotal ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'} animate-pulse`}></div>
                                <span className="text-xs font-semibold text-slate-500">รวมเป็นเงิน</span>
                            </div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                                ฿{currentTotalMoney.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden shadow-inner">
                            <div 
                                className={`h-full transition-all duration-700 ease-out ${currentTotalCount === targetTotal ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : currentTotalCount > targetTotal ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                style={{ width: `${Math.min(100, (currentTotalCount / targetTotal) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Quick Rate Selectors */}
                <div className="px-3 mb-4">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">เพิ่มราคาด่วน</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {COMMON_RATES.map(r => (
                            <button 
                                key={r}
                                onClick={() => addRateItem(r)}
                                disabled={items.some(it => it.rate === r)}
                                className="relative overflow-hidden bg-white border border-slate-200/80 rounded-xl py-3.5 font-black text-slate-700 shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:bg-slate-50 disabled:scale-100 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50"></div>
                                <span className="relative z-10">{r}</span>
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <select 
                            value={selectedOtherRate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedOtherRate(val)
                                if (val) {
                                    addRateItem(Number(val))
                                    setSelectedOtherRate("")
                                }
                            }}
                            className="w-full bg-white border border-slate-200/80 p-3.5 rounded-xl font-bold text-slate-600 appearance-none focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all cursor-pointer group-hover:border-indigo-300 hover:shadow-md"
                        >
                            <option value="" disabled>ราคาอื่นๆ (฿)...</option>
                            {OTHER_RATES.map(r => (
                                <option key={r} value={r} disabled={items.some(it => it.rate === r)}>฿{r}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100/80 rounded-lg flex items-center justify-center pointer-events-none group-hover:bg-indigo-50 transition-colors">
                            <i className="fa-solid fa-chevron-down text-slate-400 group-hover:text-indigo-500 text-xs transition-colors"></i>
                        </div>
                    </div>
                </div>

                {/* Selected Items List */}
                <div className="flex-1 px-3 space-y-3 pb-4">
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200/80 rounded-3xl bg-slate-50/50 mt-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <i className="fa-solid fa-hand-pointer text-2xl text-indigo-300"></i>
                            </div>
                            <h3 className="font-bold text-slate-600 mb-1">ยังไม่มีรายการ</h3>
                            <p className="text-xs text-slate-400 font-medium">กดเลือกราคาด้านบนเพื่อเริ่มต้น</p>
                        </div>
                    )}
                    
                    {items.map(item => (
                        <div key={item.id} className="group relative bg-white rounded-2xl p-2.5 transition-all hover:shadow-lg border border-slate-100 shadow-sm flex items-center animate-in slide-in-from-bottom-2 fade-in duration-300 hover:-translate-y-0.5">
                            {/* Accent line */}
                            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                            
                            {/* Rate display */}
                            <div className="w-[72px] flex flex-col items-center justify-center py-2 px-1 bg-slate-50/80 rounded-xl ml-2 border border-slate-100/50">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">เรตราคา</span>
                                <span className="font-black text-lg text-indigo-600 tracking-tight">{item.rate}</span>
                            </div>
                            
                            {/* Counter controls */}
                            <div className="flex-1 flex items-center justify-between px-3">
                                <button 
                                    onClick={() => updateItemCount(item.id, -1)}
                                    className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center active:bg-slate-100 active:scale-90 transition-all hover:border-slate-300 hover:text-slate-800"
                                >
                                    <i className="fa-solid fa-minus text-sm"></i>
                                </button>
                                
                                <div className="flex-1 text-center px-2">
                                    <span className="block text-3xl font-black text-slate-800 tabular-nums tracking-tighter">
                                        {item.count}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => updateItemCount(item.id, 1)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_4px_10px_-2px_rgba(79,70,229,0.5)] text-white flex items-center justify-center active:scale-90 transition-all hover:brightness-110"
                                >
                                    <i className="fa-solid fa-plus text-sm"></i>
                                </button>
                            </div>
                            
                            {/* Delete button */}
                            <button 
                                onClick={() => removeItem(item.id)}
                                className="w-9 h-9 ml-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-90"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Sticky Action Button for Save */}
                <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-2 px-2 mt-4">
                    <button 
                        onClick={handleSaveClick} 
                        disabled={isPending || currentTotalCount !== targetTotal || targetTotal === 0}
                        className="group relative w-full overflow-hidden rounded-[1.25rem] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_15px_30px_-10px_rgba(16,185,129,0.6)] transition-all active:scale-[0.98]"
                    >
                        <div className={`absolute inset-0 transition-all duration-500 ${currentTotalCount === targetTotal ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-400'}`}></div>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative flex items-center justify-center py-4 text-white font-black text-lg tracking-wide">
                            {isPending ? (
                                <i className="fa-solid fa-circle-notch fa-spin mr-3 text-xl"></i>
                            ) : (
                                <i className="fa-solid fa-cloud-arrow-up mr-3 text-xl group-hover:-translate-y-1 transition-transform"></i>
                            )}
                            ยืนยันการบันทึก
                        </div>
                    </button>
                </div>
            </div>

            <ShadcnModal
                isOpen={showSaveModal}
                title="ยืนยันการบันทึกข้อมูล"
                description={`คุณกำลังบันทึกยอด ${targetTotal} ชิ้น รวมเป็นเงิน ฿${currentTotalMoney.toLocaleString()}`}
                confirmText="บันทึกเลย!"
                cancelText="ตรวจสอบใหม่"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveModal(false)}
            />
        </>
    )
}
