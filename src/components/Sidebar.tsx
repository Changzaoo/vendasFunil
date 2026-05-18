import { useLocation } from 'wouter'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  TrendingUp,
  GitMerge,
  Tag,
  Zap,
  UserCheck,
  Building2,
  Settings,
  Bot,
  Calendar,
  ChevronRight,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Conversas', icon: MessageSquare, href: '/conversations' },
  { label: 'Contatos', icon: Users, href: '/contacts' },
  { label: 'Leads', icon: Zap, href: '/leads' },
  { label: 'Funil de Vendas', icon: GitMerge, href: '/funnel' },
  { label: 'Agenda', icon: Calendar, href: '/schedule' },
  { label: 'Métricas', icon: TrendingUp, href: '/metrics' },
]

const management = [
  { label: 'Vendedores', icon: UserCheck, href: '/sellers' },
  { label: 'Departamentos', icon: Building2, href: '/departments' },
  { label: 'Etiquetas', icon: Tag, href: '/labels' },
]

const system = [
  { label: 'Assistente IA', icon: Bot, href: '/ai-assistant' },
  { label: 'Configurações', icon: Settings, href: '/settings' },
]

type NavItemProps = {
  label: string
  icon: React.ElementType
  href: string
  active: boolean
  onClick: () => void
}

function NavItem({ label, icon: Icon, active, onClick }: NavItemProps) {
  return (
    <button onClick={onClick} className={cn('nav-item w-full', active && 'active')}>
      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1 text-left">{label}</span>
      {active && <ChevronRight size={12} className="opacity-50" />}
    </button>
  )
}

type NavGroupProps = {
  title: string
  items: typeof nav
  location: string
  navigate: (href: string) => void
}

function NavGroup({ title, items, location, navigate }: NavGroupProps) {
  return (
    <div className="mb-4">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-apple-text-4">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location === item.href}
            onClick={() => navigate(item.href)}
          />
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  const [location, navigate] = useLocation()

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-white border-r border-apple-gray-3 flex flex-col z-30"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-apple-gray-3">
        <div className="w-8 h-8 rounded-[8px] bg-apple-blue flex items-center justify-center shadow-sm">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-apple-text leading-none">Sales AI</p>
          <p className="text-[10px] text-apple-text-4 mt-0.5">Assistente de Vendas</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavGroup title="Principal" items={nav} location={location} navigate={navigate} />
        <NavGroup title="Gestão" items={management} location={location} navigate={navigate} />
        <NavGroup title="Sistema" items={system} location={location} navigate={navigate} />
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-apple-gray-3 pt-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-xs font-semibold text-apple-blue">
            VS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-apple-text truncate">Vinicius</p>
            <p className="text-xs text-apple-text-4 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
