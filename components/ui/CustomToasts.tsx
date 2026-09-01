import { toast as sonnerToast } from 'sonner'
import React from 'react'

/** 
 * Mantine Style Notification 
 * Top-Right, Left colored border, circle icon
 */
export const mantineToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const colors = {
        success: 'border-green-500 text-green-500 bg-green-50',
        error: 'border-red-500 text-red-500 bg-red-50',
        info: 'border-blue-500 text-blue-500 bg-blue-50'
    }
    const icons = {
        success: 'fa-check',
        error: 'fa-xmark',
        info: 'fa-info'
    }

    sonnerToast.custom((t) => (
        <div className="w-[350px] bg-white rounded-lg shadow-lg border border-slate-100 flex overflow-hidden">
            {/* Left color bar */}
            <div className={`w-1.5 ${colors[type].split(' ')[0]}`}></div>
            <div className="p-4 flex gap-3 flex-1 items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${colors[type]}`}>
                    <i className={`fa-solid ${icons[type]} text-xs`}></i>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{message}</p>
                </div>
                <button onClick={() => sonnerToast.dismiss(t)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    ), { position: 'top-right', duration: 4000 })
}

/**
 * Notistack Style Notification
 * Bottom-Center, Material elevation, simple card
 */
export const notistackToast = (message: string, type: 'default' | 'success' | 'error' | 'warning' = 'default') => {
    const bgColors = {
        default: 'bg-slate-800 text-white',
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-orange-500 text-white'
    }

    sonnerToast.custom((t) => (
        <div className={`w-[300px] rounded shadow-[0_3px_5px_-1px_rgba(0,0,0,0.2),0_6px_10px_0_rgba(0,0,0,0.14),0_1px_18px_0_rgba(0,0,0,0.12)] p-3 px-4 flex justify-between items-center ${bgColors[type]}`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={() => sonnerToast.dismiss(t)} className="text-white/70 hover:text-white transition-colors ml-4 text-xs font-bold uppercase">
                ปิด
            </button>
        </div>
    ), { position: 'bottom-center', duration: 3000 })
}
