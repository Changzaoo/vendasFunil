import { Sidebar } from './Sidebar'

type ShellProps = {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Shell({ children, title, subtitle, actions }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width)' }}>
        {(title || actions) && (
          <header
            className="sticky top-0 z-20 bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-b border-apple-gray-3 dark:border-[#3A3A3C] px-8 flex items-center justify-between"
            style={{ minHeight: 'var(--header-height)' }}
          >
            <div>
              {title && <h1 className="text-base font-semibold text-apple-text dark:text-[#F5F5F7]">{title}</h1>}
              {subtitle && <p className="text-xs text-apple-text-4 dark:text-[#636366] mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
        )}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
