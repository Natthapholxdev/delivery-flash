'use client'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ShadcnModalProps = {
    isOpen: boolean;
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
    children?: React.ReactNode;
}

export default function ShadcnModal({ 
    isOpen, 
    title, 
    description, 
    confirmText = 'Continue', 
    cancelText = 'Cancel', 
    onConfirm, 
    onCancel, 
    isDestructive = false,
    children
}: ShadcnModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (isOpen) setMounted(true)
        else setTimeout(() => setMounted(false), 200) // wait for animation
    }, [isOpen])

    if (!mounted && !isOpen) return null
    if (typeof document === 'undefined') return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onCancel}
            ></div>
            
            {/* Dialog Content */}
            <div 
                className={`z-50 w-full sm:max-w-lg bg-white sm:rounded-xl rounded-t-xl p-6 shadow-lg border border-slate-200 transition-all duration-200 ${isOpen ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'} pb-10 sm:pb-6`}
            >
                <div className="flex flex-col space-y-2 text-center sm:text-left mb-6">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
                    {description && <p className="text-sm text-slate-500">{description}</p>}
                </div>
                
                {children && <div className="mb-6">{children}</div>}
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
                    <button 
                        onClick={onCancel}
                        className="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDestructive ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
