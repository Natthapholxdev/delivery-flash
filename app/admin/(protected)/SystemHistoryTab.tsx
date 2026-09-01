'use client'
import { useState, useEffect, useTransition } from 'react'
import { getAllDeliveries, deleteDelivery, updateDeliveryRate, getEditLogs, getProfiles, importCSVData } from '@/app/actions/admin'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import ShadcnModal from '@/components/ui/ShadcnModal'
import { toast as hotToast } from 'react-hot-toast'
import { toast as sonnerToast } from 'sonner'

export default function SystemHistoryTab() {
    const [records, setRecords] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    // Modals state
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editRecord, setEditRecord] = useState<{ id: string, rate: number } | null>(null)
    const [editRateValue, setEditRateValue] = useState<string>('')
    
    // Import state
    const [showImportModal, setShowImportModal] = useState(false)
    const [importUserId, setImportUserId] = useState('')
    const [csvText, setCsvText] = useState('')

    // Table state
    const [searchTerm, setSearchTerm] = useState('')
    const [sortKey, setSortKey] = useState<'delivery_date' | 'profiles.username'>('delivery_date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const filteredRecords = records.filter(r => 
        (r.profiles?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        format(new Date(r.delivery_date), 'dd MMM yyyy', { locale: th }).includes(searchTerm)
    ).sort((a, b) => {
        let valA, valB
        if (sortKey === 'delivery_date') { valA = new Date(a.delivery_date).getTime(); valB = new Date(b.delivery_date).getTime() }
        else { valA = a.profiles?.username || ''; valB = b.profiles?.username || '' }
        
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
    const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const toggleSort = (key: 'delivery_date' | 'profiles.username') => {
        if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortOrder('asc') }
    }

    const fetchRecords = async () => {
        const [res, logRes, profRes] = await Promise.all([
            getAllDeliveries(),
            getEditLogs(),
            getProfiles()
        ])
        if (res.data) setRecords(res.data)
        if (logRes.data) setLogs(logRes.data)
        if (profRes.data) setProfiles(profRes.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    const handleImportCSV = () => {
        if (!importUserId) {
            sonnerToast.error('à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™à¸à¹ˆà¸­à¸™')
            return
        }
        if (!csvText.trim()) {
            sonnerToast.error('à¸à¸£à¸¸à¸“à¸²à¸§à¸²à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ CSV')
            return
        }

        const lines = csvText.trim().split('\n')
        const recordsToInsert: { delivery_date: string, quantity: number, rate_per_piece: number, created_at: string }[] = []

        if (lines.length === 0) return

        // Parse header to find indexes dynamically
        const headerCols = lines[0].toLowerCase().split(',').map(c => c.trim().replace(/"/g, ''))
        const dateIdx = headerCols.indexOf('delivery_date')
        const qtyIdx = headerCols.indexOf('quantity')
        const rateIdx = headerCols.indexOf('rate_per_piece')
        const createdIdx = headerCols.indexOf('created_at')

        // Fallback indexes if header is missing or unrecognized
        const dIdx = dateIdx >= 0 ? dateIdx : 2
        const qIdx = qtyIdx >= 0 ? qtyIdx : 3
        const rIdx = rateIdx >= 0 ? rateIdx : 4
        const cIdx = createdIdx >= 0 ? createdIdx : 5

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue
            
            // Skip the header line
            if (i === 0 && line.toLowerCase().includes('delivery_date')) continue

            // Robust CSV line split handling quotes and empty fields
            const cols = [];
            let curr = '';
            let inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                if (line[j] === '"') inQuotes = !inQuotes;
                else if (line[j] === ',' && !inQuotes) { cols.push(curr.trim()); curr = ''; }
                else curr += line[j];
            }
            cols.push(curr.trim());

            const cleanCol = (str: string) => (str || '').replace(/^"|"$/g, '').trim()

            if (cols.length >= Math.max(dIdx, qIdx, rIdx)) {
                const delivery_date = cleanCol(cols[dIdx])
                const qtyRaw = cleanCol(cols[qIdx])
                const rateRaw = cleanCol(cols[rIdx])
                
                const quantity = Number(qtyRaw)
                const rate_per_piece = Number(rateRaw)
                
                let created_at = cIdx >= 0 && cols[cIdx] ? cleanCol(cols[cIdx]) : ''
                
                if (!created_at || created_at === '') {
                    created_at = new Date(delivery_date).toISOString()
                }

                if (delivery_date && !isNaN(quantity) && !isNaN(rate_per_piece) && quantity > 0) {
                    recordsToInsert.push({
                        delivery_date,
                        quantity,
                        rate_per_piece,
                        created_at
                    })
                }
            }
        }

        if (recordsToInsert.length === 0) {
            sonnerToast.error('à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¹ƒà¸™ CSV à¸«à¸£à¸·à¸­à¸­à¹ˆà¸²à¸™à¸„à¸­à¸¥à¸±à¸¡à¸™à¹Œà¹„à¸¡à¹ˆà¸•à¸£à¸‡')
            return
        }

        startTransition(async () => {
            const promise = importCSVData(importUserId, recordsToInsert).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(promise, {
                loading: `à¸à¸³à¸¥à¸±à¸‡à¸™à¸³à¹€à¸‚à¹‰à¸² ${recordsToInsert.length} à¸£à¸²à¸¢à¸à¸²à¸£...`,
                success: `à¸™à¸³à¹€à¸‚à¹‰à¸² ${recordsToInsert.length} à¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ!`,
                error: (err) => err.message
            })

            await promise.catch(() => {})
            setShowImportModal(false)
            setCsvText('')
            setImportUserId('')
            fetchRecords()
        })
    }


    const confirmDelete = () => {
        if (!deleteId) return
        startTransition(async () => {
            const promise = deleteDelivery(deleteId).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })
            
            hotToast.promise(promise, {
                loading: 'à¸à¸³à¸¥à¸±à¸‡à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£...',
                success: 'à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ',
                error: (err) => err.message
            })

            await promise.catch(() => {})
            setDeleteId(null)
            fetchRecords()
        })
    }

    const handleEditClick = (id: string, currentRate: number) => {
        setEditRecord({ id, rate: currentRate })
        setEditRateValue(currentRate.toString())
    }

    const confirmEdit = () => {
        if (!editRecord || !editRateValue) return
        
        startTransition(async () => {
            const promise = updateDeliveryRate(editRecord.id, Number(editRateValue)).then(res => {
                if (res.error) throw new Error(res.error)
                return res
            })

            hotToast.promise(promise, {
                loading: 'à¸à¸³à¸¥à¸±à¸‡à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¸²à¸„à¸²...',
                success: 'à¸­à¸±à¸›à¹€à¸”à¸•à¸£à¸²à¸„à¸²à¸ªà¸³à¹€à¸£à¹‡à¸ˆ',
                error: (err) => err.message
            })

            await promise.catch(() => {})
            setEditRecord(null)
            fetchRecords()
        })
    }

    if (loading) return <div className="flex justify-center p-12"><i className="fa-solid fa-circle-notch fa-spin text-red-600 text-3xl"></i></div>

    return (
        <div className="space-y-6">
            {/* Edit Logs Section */}
            {logs.length > 0 && (
                <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                    <div className="p-4 border-b border-red-200 flex items-center bg-red-100/50">
                        <i className="fa-solid fa-bell text-red-600 mr-2"></i>
                        <h2 className="text-lg font-bold text-red-800">à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™: à¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚à¸¢à¸­à¸”à¸ˆà¸²à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™ (Audit Log)</h2>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-60">
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="bg-white p-3 rounded-xl border border-red-100 text-sm shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-gray-800">
                                            <i className="fa-solid fa-user text-gray-400 mr-1"></i> {log.profiles?.username}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: th })}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg mb-2">
                                        <div>
                                            <span className="text-gray-500 text-xs block">à¹€à¸”à¸´à¸¡</span>
                                            <span className="font-medium text-gray-400 line-through">{log.old_count} à¸Šà¸´à¹‰à¸™ (à¹€à¸£à¸• à¸¿{log.old_rate})</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">à¹ƒà¸«à¸¡à¹ˆ</span>
                                            <span className="font-bold text-red-600">{log.new_count} à¸Šà¸´à¹‰à¸™ (à¹€à¸£à¸• à¸¿{log.new_rate})</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-600 bg-red-50/50 p-2 rounded-lg italic">
                                        <span className="font-semibold not-italic">à¹€à¸«à¸•à¸¸à¸œà¸¥:</span> {log.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">ประวัติระบบรวมทั้งหมด</h2>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text"
                                placeholder="ค้นหาชื่อพนักงาน หรือวันที่..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-gray-50 border border-gray-200 rounded-xl text-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={10}>10 แถว</option>
                            <option value={20}>20 แถว</option>
                            <option value={50}>50 แถว</option>
                            <option value={100}>100 แถว</option>
                        </select>
                        <button 
                            onClick={() => setShowImportModal(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <i className="fa-solid fa-file-import"></i> นำเข้า CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm">
                                <th className="p-4 font-medium w-16 text-center">ลำดับ</th>
                                <th className="p-4 font-medium cursor-pointer hover:text-indigo-600 select-none" onClick={() => toggleSort('delivery_date')}>
                                    วันที่ {sortKey === 'delivery_date' && <i className={`fa-solid fa-sort-${sortOrder==='asc'?'up':'down'} ml-1`}></i>}
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:text-indigo-600 select-none" onClick={() => toggleSort('profiles.username')}>
                                    พนักงาน {sortKey === 'profiles.username' && <i className={`fa-solid fa-sort-${sortOrder==='asc'?'up':'down'} ml-1`}></i>}
                                </th>
                                <th className="p-4 font-medium text-center">จำนวน</th>
                                <th className="p-4 font-medium text-center">ราคา/ชิ้น</th>
                                <th className="p-4 font-medium text-right">รวมเป็นเงิน</th>
                                <th className="p-4 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedRecords.map((r: any, i: number) => (
                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-gray-500 text-sm text-center">
                                        {((currentPage - 1) * itemsPerPage) + i + 1}
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        <div className="flex items-center">
                                            <i className="fa-solid fa-calendar-days text-gray-400 mr-2"></i>
                                            {format(new Date(r.delivery_date), 'dd MMM yyyy', { locale: th })}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{r.profiles?.username}</td>
                                    <td className="p-4 text-gray-700 text-center">
                                        <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md text-sm">
                                            <i className="fa-solid fa-box text-gray-500 mr-1"></i>
                                            {r.quantity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700 text-center">฿{r.rate_per_piece}</td>
                                    <td className="p-4 font-bold text-green-600 text-right">
                                        ฿{(r.quantity * Number(r.rate_per_piece)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-right space-x-1">
                                        <button 
                                            disabled={isPending}
                                            onClick={() => handleEditClick(r.id, r.rate_per_piece)}
                                            className="inline-flex items-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="แก้ไขราคา"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button 
                                            disabled={isPending}
                                            onClick={() => setDeleteId(r.id)}
                                            className="inline-flex items-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                            title="ลบรายการ"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                            แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, filteredRecords.length)} จากทั้งหมด {filteredRecords.length} รายการ
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <div className="flex items-center px-3 font-medium text-gray-700">
                                หน้า {currentPage} / {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <ShadcnModal
                isOpen={!!deleteId}
                title="à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£?"
                description="à¸„à¸¸à¸“à¹à¸™à¹ˆà¹ƒà¸ˆà¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆà¸§à¹ˆà¸²à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸™à¸µà¹‰ à¸à¸²à¸£à¸à¸£à¸°à¸—à¸³à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¹‰à¸­à¸™à¸à¸¥à¸±à¸šà¹„à¸”à¹‰"
                confirmText="à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            {/* Edit Rate Modal */}
            <ShadcnModal
                isOpen={!!editRecord}
                title="à¹à¸à¹‰à¹„à¸‚à¸£à¸²à¸„à¸²à¸•à¹ˆà¸­à¸Šà¸´à¹‰à¸™"
                confirmText="à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¸²à¸„à¸²à¹ƒà¸«à¸¡à¹ˆ"
                onConfirm={confirmEdit}
                onCancel={() => setEditRecord(null)}
            >
                <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">à¸£à¸°à¸šà¸¸à¸£à¸²à¸„à¸²à¹ƒà¸«à¸¡à¹ˆ</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        className="w-full border-gray-300 border p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500" 
                        value={editRateValue} 
                        onChange={(e) => setEditRateValue(e.target.value)} 
                    />
                </div>
            </ShadcnModal>

            {/* Import CSV Modal */}
            <ShadcnModal
                isOpen={showImportModal}
                title="à¸™à¸³à¹€à¸‚à¹‰à¸²à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸à¹ˆà¸²à¸ˆà¸²à¸ CSV"
                confirmText="à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸™à¸³à¹€à¸‚à¹‰à¸²"
                onConfirm={handleImportCSV}
                onCancel={() => { setShowImportModal(false); setCsvText(''); }}
            >
                <div className="mt-2 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">à¹€à¸¥à¸·à¸­à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸ˆà¸°à¸£à¸±à¸šà¸¢à¸­à¸”à¸™à¸µà¹‰</label>
                        <select 
                            value={importUserId} 
                            onChange={(e) => setImportUserId(e.target.value)}
                            className="w-full border-gray-300 border p-3 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">-- à¹€à¸¥à¸·à¸­à¸à¸žà¸™à¸±à¸à¸‡à¸²à¸™ --</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.username}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">à¸­à¸±à¸›à¹‚à¸«à¸¥à¸”à¹„à¸Ÿà¸¥à¹Œ CSV</label>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    setCsvText(event.target?.result as string);
                                };
                                reader.readAsText(file);
                            }}
                            className="w-full border border-dashed border-gray-300 p-4 rounded-xl text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {csvText && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center">
                                <i className="fa-solid fa-circle-check mr-2"></i>
                                à¸­à¹ˆà¸²à¸™à¹„à¸Ÿà¸¥à¹Œà¸ªà¸³à¹€à¸£à¹‡à¸ˆ ({csvText.split('\n').length} à¸šà¸£à¸£à¸—à¸±à¸”) à¸žà¸£à¹‰à¸­à¸¡à¸™à¸³à¹€à¸‚à¹‰à¸²à¸‚à¹‰à¸­à¸¡à¸¹à¸¥
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">à¸­à¸±à¸›à¹‚à¸«à¸¥à¸”à¹„à¸Ÿà¸¥à¹Œ CSV à¸—à¸µà¹ˆ Export à¸¡à¸²à¸ˆà¸²à¸à¸à¸²à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸à¹ˆà¸²</p>
                    </div>
                </div>
            </ShadcnModal>
        </div>
    )
}
