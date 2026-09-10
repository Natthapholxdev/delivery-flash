'use client'
import { useState, useTransition, useMemo, useRef, useEffect, useCallback } from 'react'
import { saveDeliveries } from '@/app/actions/deliveries'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ShadcnModal from '@/components/ui/ShadcnModal'

type RateItem = {
    id: string;
    rate: number;
    count: number;
}

const COMMON_RATES = [6.75, 7.00, 8.75, 9.00]

const buzz = (ms: number | number[] = 10) => {
    try { navigator.vibrate?.(ms) } catch { /* unsupported */ }
}

/** Press-and-hold repeat: fires onPress on press, then repeats after delay while held. */
function useHoldRepeat(onPress: () => void, delay = 400, interval = 80) {
    const timers = useRef<{ hold?: ReturnType<typeof setTimeout>, repeat?: ReturnType<typeof setInterval> }>({})

    const stop = useCallback(() => {
        clearTimeout(timers.current.hold)
        clearInterval(timers.current.repeat)
        timers.current = {}
    }, [])

    useEffect(() => stop, [stop])

    const start = useCallback(() => {
        stop()
        onPress()
        timers.current.hold = setTimeout(() => {
            timers.current.repeat = setInterval(onPress, interval)
        }, delay)
    }, [onPress, delay, interval, stop])

    return { start, stop }
}

/** Single tap = 1 press, hold = auto-repeat. Pointer events only (never combined with onClick). */
function HoldButton({ onPress, className, disabled, ariaLabel, icon }: {
    onPress: () => void;
    className: string;
    disabled?: boolean;
    ariaLabel: string;
    icon: string;
}) {
    const repeat = useHoldRepeat(onPress)
    return (
        <button
            onPointerDown={(e) => { if (!disabled) { e.preventDefault(); repeat.start() } }}
            onPointerUp={repeat.stop}
            onPointerLeave={repeat.stop}
            onPointerCancel={repeat.stop}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !disabled) {
                    e.preventDefault()
                    onPress()
                }
            }}
            disabled={disabled}
            className={`${className} select-none touch-manipulation`}
            aria-label={ariaLabel}
        >
            <i className={`${icon} text-sm pointer-events-none`}></i>
        </button>
    )
}

export default function TrackerTab() {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [totalStr, setTotalStr] = useState('')
    const [isConfirmedTotal, setIsConfirmedTotal] = useState(false)
    const [items, setItems] = useState<RateItem[]>([])
    const [isPending, startTransition] = useTransition()
    const [customRate, setCustomRate] = useState('')
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem('tracker_draft')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (parsed.date) setDate(parsed.date)
                if (parsed.totalStr) setTotalStr(parsed.totalStr)
                if (parsed.isConfirmedTotal !== undefined) setIsConfirmedTotal(parsed.isConfirmedTotal)
                if (parsed.items) setItems(parsed.items)
            }
        } catch(e) {}
        setLoaded(true)
    }, [])

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem('tracker_draft', JSON.stringify({
            date, totalStr, isConfirmedTotal, items
        }))
    }, [date, totalStr, isConfirmedTotal, items, loaded])

    const targetTotal = Number(totalStr) || 0

    const currentTotalCount = useMemo(() => items.reduce((s, it) => s + it.count, 0), [items])
    const currentTotalMoney = useMemo(() => items.reduce((s, it) => s + it.count * it.rate, 0), [items])
    const remaining = targetTotal - currentTotalCount
    const isComplete = remaining === 0 && currentTotalCount > 0
    const isOver = remaining < 0

    const handleStartClick = () => {
        if (targetTotal <= 0 || targetTotal > 5000) {
            toast.error('กรุณาระบุจำนวนพัสดุให้ถูกต้อง (1-5000)')
            return
        }
        buzz(15)
        setIsConfirmedTotal(true)
        if (items.length === 0) {
            setItems([{ id: Date.now().toString(), rate: 6.75, count: 0 }])
        }
        toast('พร้อมกรอกยอด! กดปุ่มราคาแล้วเพิ่มจำนวนชิ้นได้เลย', { icon: '📦' })
    }

    const addRateItem = (rate: number) => {
        buzz(10)
        setItems(prev => prev.some(it => it.rate === rate)
            ? prev
            : [...prev, { id: Date.now().toString() + '-' + rate, rate, count: 0 }]
        )
    }

    const handleAddCustomRate = () => {
        const rate = Number(customRate)
        if (!rate || rate <= 0) {
            toast.error('กรุณากรอกราคาให้ถูกต้อง')
            return
        }
        if (items.some(it => it.rate === rate)) {
            toast.error(`มีราคา ฿${rate} ในรายการอยู่แล้ว`)
            setCustomRate('')
            return
        }
        setCustomRate('')
        addRateItem(Math.round(rate * 100) / 100)
    }

    const changeCount = useCallback((id: string, delta: number) => {
        buzz(8)
        setItems(prev => prev.map(it => it.id === id
            ? { ...it, count: Math.max(0, Math.min(targetTotal, it.count + delta)) }
            : it
        ))
    }, [targetTotal])

    const setCount = (id: string, value: string) => {
        const clean = value.replace(/[^\d]/g, '')
        setItems(prev => prev.map(it => it.id === id
            ? { ...it, count: Math.min(targetTotal, Number(clean) || 0) }
            : it
        ))
    }

    const removeItem = (id: string) => {
        buzz(15)
        setItems(prev => prev.filter(it => it.id !== id))
    }

    const handleSaveClick = () => {
        if (currentTotalCount !== targetTotal) {
            toast.error(`ยอดรวมชิ้นงาน (${currentTotalCount}) ไม่ตรงกับยอดเป้าหมาย (${targetTotal})`)
            return
        }
        if (!items.some(it => it.count > 0)) {
            toast.error('กรุณาระบุจำนวนชิ้นอย่างน้อย 1 รายการ')
            return
        }
        setShowSaveModal(true)
    }

    const confirmSave = () => {
        setShowSaveModal(false)
        const payload = items.filter(it => it.count > 0).map(it => ({ rate: it.rate, count: it.count }))

        startTransition(async () => {
            const res = await toast.promise(
                saveDeliveries(payload, date).then(r => {
                    if (r.error) throw new Error(r.error)
                    return r
                }),
                {
                    loading: 'กำลังบันทึกข้อมูล...',
                    success: 'บันทึกยอดจัดส่งเรียบร้อย! 🎉',
                    error: (e: Error) => e?.message || 'เกิดข้อผิดพลาดในการบันทึก'
                }
            ).catch(() => null)
            if (res && !res.error) {
                buzz([30, 50, 30])
                setTotalStr('')
                setIsConfirmedTotal(false)
                setItems([])
            }
        })
    }

    if (!isConfirmedTotal) {
        return (
            <div className="flex flex-col h-full justify-center p-2 sm:p-4 mt-8 sm:mt-0">
                <div className="max-w-sm mx-auto w-full animate-in fade-in zoom-in duration-500">
                    <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2rem] p-8 border border-white/50 mb-24">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-[inset_0_2px_10px_rgba(255,255,255,1),0_10px_20px_-10px_rgba(79,70,229,0.3)] border border-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                            <i className="fa-solid fa-box-open text-4xl text-blue-600 drop-shadow-sm"></i>
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 text-center mb-2 tracking-tight">ตั้งยอดวันนี้</h2>
                        <p className="text-slate-500 text-center text-sm mb-8 font-medium">ระบุจำนวนพัสดุทั้งหมดที่คุณจัดส่ง</p>

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10 rounded-full">วันที่จัดส่ง</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-700 transition-all shadow-inner" />
                            </div>

                            <div className="relative">
                                <label className="absolute -top-2.5 left-4 px-1.5 bg-white text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10 rounded-full">เป้าหมาย (ชิ้น)</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        autoComplete="off"
                                        value={totalStr}
                                        onChange={e => setTotalStr(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                                        onKeyDown={e => { if (e.key === 'Enter') handleStartClick() }}
                                        className="w-full bg-slate-50/50 border border-slate-200 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-4xl text-slate-800 text-center transition-all shadow-inner placeholder:text-slate-300"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-6 text-slate-400 font-bold">ชิ้น</span>
                                </div>
                            </div>

                            <button
                                onClick={handleStartClick}
                                disabled={!totalStr || Number(totalStr) <= 0}
                                className="w-full bg-blue-600 hover:bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.8)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group/btn"
                            >
                                เริ่มบันทึกยอด <i className="fa-solid fa-arrow-right ml-3 transition-transform group-hover/btn:translate-x-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col relative animate-in fade-in zoom-in-95 duration-500 min-h-[60vh]">
                {/* Sticky summary header */}
                <div className="sticky top-0 z-30 mx-1 mb-6 pt-2">
                    <div className="absolute inset-0 top-2 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-[2rem] blur-xl"></div>
                    <div className="relative bg-white/85 backdrop-blur-2xl border border-white shadow-xl rounded-[1.5rem] p-5">
                        <div className="flex justify-between items-start mb-3">
                            <button
                                onClick={() => setIsConfirmedTotal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all shadow-sm backdrop-blur-md"
                                aria-label="ย้อนกลับ"
                            >
                                <i className="fa-solid fa-arrow-left text-sm"></i>
                            </button>
                            <div className="text-center">
                                <span className="block text-[10px] font-bold tracking-widest text-indigo-500 uppercase mb-0.5">สถานะปัจจุบัน</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className={`text-4xl font-black tracking-tighter tabular-nums transition-colors ${isOver ? 'text-red-500' : isComplete ? 'text-emerald-500' : 'text-slate-800'}`}>
                                        {currentTotalCount}
                                    </span>
                                    <span className="text-slate-400 font-bold text-lg">/ {targetTotal}</span>
                                </div>
                            </div>
                            <div className="w-8"></div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200/60">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isComplete ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isOver ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`}></div>
                                <span className="text-xs font-semibold text-slate-500">รวมเป็นเงิน</span>
                            </div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 tabular-nums">
                                ฿{currentTotalMoney.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden shadow-inner">
                            <div
                                className={`h-full transition-all duration-700 ease-out ${isOver ? 'bg-gradient-to-r from-red-400 to-red-500' : isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                style={{ width: `${Math.min(100, (currentTotalCount / Math.max(1, targetTotal)) * 100)}%` }}
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
                        {COMMON_RATES.map(r => {
                            const added = items.some(it => it.rate === r)
                            return (
                                <button
                                    key={r}
                                    onClick={() => addRateItem(r)}
                                    disabled={added}
                                    className={`relative overflow-hidden rounded-xl py-3.5 font-black shadow-sm active:scale-95 transition-all border ${added
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-400 scale-100'
                                        : 'bg-white border-slate-200/80 text-slate-700 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'}`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-1">
                                        {added && <i className="fa-solid fa-check text-[10px]"></i>}
                                        {r}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={customRate}
                                onChange={e => setCustomRate(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 6))}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddCustomRate() }}
                                placeholder="ราคาอื่นๆ กรอกเองได้เลย"
                                className="w-full bg-white border border-slate-200/80 p-3.5 pl-9 rounded-xl font-bold text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            onClick={handleAddCustomRate}
                            disabled={!customRate || Number(customRate) <= 0}
                            className="px-5 rounded-xl bg-slate-800 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2"
                        >
                            <i className="fa-solid fa-plus text-sm"></i> เพิ่ม
                        </button>
                    </div>
                </div>

                {/* Selected Items List */}
                <div className="flex-1 px-3 space-y-3 pb-36">
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
                        <RateRow
                            key={item.id}
                            item={item}
                            max={targetTotal}
                            onChangeCount={changeCount}
                            onSetCount={setCount}
                            onRemove={removeItem}
                        />
                    ))}
                </div>

                {/* Fixed Save Button (sticky breaks inside overflow-hidden card) */}
                <div className="fixed bottom-24 left-0 right-0 z-30 px-4 pointer-events-none">
                    <div className="max-w-lg mx-auto relative bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-6 pb-2 px-2 pointer-events-auto">
                        <button
                        onClick={handleSaveClick}
                        disabled={isPending || !isComplete}
                        className={`group relative w-full overflow-hidden rounded-[1.25rem] shadow-[0_15px_30px_-10px_rgba(16,185,129,0.6)] transition-all active:scale-[0.98] disabled:cursor-not-allowed ${isComplete ? '' : 'opacity-60'}`}
                    >
                        <div className={`absolute inset-0 transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-400'}`}></div>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative flex items-center justify-center py-4 text-white font-black text-lg tracking-wide">
                            {isPending ? (
                                <i className="fa-solid fa-circle-notch fa-spin mr-3 text-xl"></i>
                            ) : isComplete ? (
                                <i className="fa-solid fa-cloud-arrow-up mr-3 text-xl group-hover:-translate-y-1 transition-transform"></i>
                            ) : (
                                <i className="fa-solid fa-list-check mr-3 text-xl"></i>
                            )}
                            {isPending
                                ? 'กำลังบันทึก...'
                                : isComplete
                                    ? 'ยืนยันการบันทึก'
                                    : isOver
                                        ? `เกินเป้าหมาย ${Math.abs(remaining)} ชิ้น`
                                        : `เหลืออีก ${remaining} ชิ้น`}
                        </div>
                        </button>
                    </div>
                </div>
            </div>

            <ShadcnModal
                isOpen={showSaveModal}
                title="ยืนยันการบันทึกข้อมูล"
                description={`คุณกำลังบันทึกยอด ${targetTotal} ชิ้น รวมเป็นเงิน ฿${currentTotalMoney.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
                confirmText="บันทึกเลย!"
                cancelText="ตรวจสอบใหม่"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveModal(false)}
            />
        </>
    )
}

function RateRow({ item, max, onChangeCount, onSetCount, onRemove }: {
    item: RateItem;
    max: number;
    onChangeCount: (id: string, delta: number) => void;
    onSetCount: (id: string, value: string) => void;
    onRemove: (id: string) => void;
}) {
    const inc = useCallback(() => onChangeCount(item.id, 1), [item.id, onChangeCount])
    const dec = useCallback(() => onChangeCount(item.id, -1), [item.id, onChangeCount])

    return (
        <div className="group relative bg-white rounded-2xl p-2.5 transition-all hover:shadow-lg border border-slate-100 shadow-sm flex items-center animate-in slide-in-from-bottom-2 fade-in duration-300 hover:-translate-y-0.5">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>

            {/* Rate + subtotal */}
            <div className="w-16 sm:w-[76px] flex flex-col items-center justify-center py-2 px-1 bg-slate-50/80 rounded-xl ml-1.5 sm:ml-2 border border-slate-100/50 shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">เรตราคา</span>
                <span className="font-black text-lg text-indigo-600 tracking-tight leading-none">{item.rate}</span>
                <span className="text-[10px] font-bold text-emerald-600 tabular-nums mt-0.5">
                    ฿{(item.rate * item.count).toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                </span>
            </div>

            {/* Counter controls */}
            <div className="flex-1 min-w-0 flex items-center justify-between px-1.5 sm:px-3">
                <HoldButton
                    onPress={dec}
                    disabled={item.count === 0}
                    ariaLabel="ลดจำนวน"
                    icon="fa-solid fa-minus"
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center active:bg-slate-100 active:scale-90 transition-all hover:border-slate-300 hover:text-slate-800 disabled:opacity-40"
                />

                <input
                    type="text"
                    inputMode="numeric"
                    value={item.count}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => onSetCount(item.id, e.target.value)}
                    className="w-full flex-1 min-w-0 mx-1 text-center text-3xl font-black text-slate-800 tabular-nums tracking-tighter bg-transparent focus:outline-none focus:bg-slate-50 rounded-xl py-1 focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-200 transition-all"
                    aria-label="จำนวนชิ้น"
                />

                <HoldButton
                    onPress={inc}
                    disabled={item.count >= max}
                    ariaLabel="เพิ่มจำนวน"
                    icon="fa-solid fa-plus"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_4px_10px_-2px_rgba(79,70,229,0.5)] text-white flex items-center justify-center active:scale-90 transition-all hover:brightness-110 disabled:opacity-40"
                />
            </div>

            {/* Delete */}
            <button
                onClick={() => onRemove(item.id)}
                className="w-9 h-9 ml-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-90"
                aria-label="ลบรายการ"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>
    )
}
