"use client"
import { createContext, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'
export type ToastMessage = { id: string; text: string; variant: ToastVariant }

type ToastContextValue = {
  push: (text: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const value = useMemo(
    () => ({
      push(text: string, variant: ToastVariant = 'default') {
        const id = Math.random().toString(36).slice(2, 10)
        setToasts((current) => [...current, { id, text, variant }])
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="flex flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm shadow-xl transition transform duration-200 ease-out ${
                toast.variant === 'error'
                  ? 'bg-rose-500/95 text-white'
                  : toast.variant === 'success'
                  ? 'bg-amber-400/95 text-slate-950'
                  : 'bg-slate-900/95 text-slate-100'
              }`}
            >
              {toast.text}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
