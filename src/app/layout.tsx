import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ToastProvider from '@/components/ui/ToastProvider'
import ConfirmProvider from '@/components/ui/ConfirmProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'NEUverse Dashboard',
  description: 'NEUverse Academy Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="flex min-h-screen bg-bg font-sans">
        <ToastProvider>
          <ConfirmProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:ml-[var(--sidebar-w)]">
              <Topbar />
              <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                {children}
              </main>
            </div>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

