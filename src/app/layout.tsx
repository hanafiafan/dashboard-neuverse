import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ToastProvider from '@/components/ui/ToastProvider'

export const metadata: Metadata = {
  title: 'NEUverse Dashboard',
  description: 'NEUverse Academy Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-w)' }}>
          <Topbar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        <ToastProvider />
      </body>
    </html>
  )
}
