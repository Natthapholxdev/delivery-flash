'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      
      {/* 1. Sonner (Bottom Right, Scale-in) */}
      <SonnerToaster position="bottom-right" expand={false} richColors closeButton />
      
      {/* 2. React Hot Toast (Top Center) */}
      <HotToaster position="top-center" reverseOrder={false} />
      
      {/* 3. React Toastify (Top Right) */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />
    </>
  )
}
