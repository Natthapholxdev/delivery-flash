'use client'
import { useState, useEffect } from 'react'
import { getAllDeliveries } from '@/app/actions/admin'
import { format, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function DashboardTab() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

    useEffect(() => {
        getAllDeliveries().then(res => {
            if (res.data) {
                // Aggregate by date
                const aggregated: Record<string, { dateStr: string, totalQuantity: number, totalMoney: number }> = {}
                
                res.data.forEach(d => {
                    const date = d.delivery_date
                    if (!aggregated[date]) {
                        aggregated[date] = {
                            dateStr: format(parseISO(date), 'dd MMM', { locale: th }),
                            totalQuantity: 0,
                            totalMoney: 0
                        }
                    }
                    aggregated[date].totalQuantity += d.quantity
                    aggregated[date].totalMoney += (d.quantity * Number(d.rate_per_piece))
                })

                // Convert to array and sort by date ascending
                const sortedData = Object.keys(aggregated)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                    .map(k => aggregated[k])
                
                setData(sortedData)
            }
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="flex justify-center p-12"><i className="fa-solid fa-circle-notch fa-spin text-red-600 text-3xl"></i></div>

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-bold">{entry.value.toLocaleString()}</span>
                            {entry.name.includes('เงิน') ? ' ฿' : ' ชิ้น'}
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <i className="fa-solid fa-chart-pie text-red-500 mr-2"></i>
                        สถิติภาพรวมระบบ
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">สรุปยอดจัดส่งและยอดเงินทั้งหมดตามวัน</p>
                </div>
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button 
                        onClick={() => setChartType('bar')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <i className="fa-solid fa-chart-column mr-2"></i>Bar
                    </button>
                    <button 
                        onClick={() => setChartType('line')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartType === 'line' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <i className="fa-solid fa-chart-line mr-2"></i>Line
                    </button>
                </div>
            </div>

            {/* Quantity Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                        <i className="fa-solid fa-box"></i>
                    </div>
                    แนวโน้มจำนวนพัสดุ (ชิ้น)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="totalQuantity" name="จำนวนพัสดุ" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        ) : (
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="totalQuantity" name="จำนวนพัสดุ" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Money Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                        <i className="fa-solid fa-baht-sign"></i>
                    </div>
                    แนวโน้มยอดเงิน (บาท)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="totalMoney" name="รวมเป็นเงิน" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        ) : (
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="dateStr" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="totalMoney" name="รวมเป็นเงิน" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="h-4"></div>
        </div>
    )
}
