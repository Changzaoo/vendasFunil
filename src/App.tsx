import { Route, Switch } from 'wouter'
import { Toaster } from 'sonner'
import { FloatingAI } from '@/components/FloatingAI'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Conversations from '@/pages/Conversations'
import ConversationDetail from '@/pages/ConversationDetail'
import Contacts from '@/pages/Contacts'
import Leads from '@/pages/Leads'
import SalesFunnel from '@/pages/SalesFunnel'
import Schedule from '@/pages/Schedule'
import Metrics from '@/pages/Metrics'
import Sellers from '@/pages/Sellers'
import Departments from '@/pages/Departments'
import Labels from '@/pages/Labels'
import Settings from '@/pages/Settings'
import AIAssistant from '@/pages/AIAssistant'
import NotFound from '@/pages/NotFound'

function AppRouter() {
  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/conversations" component={Conversations} />
        <Route path="/conversations/:id" component={ConversationDetail} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/leads" component={Leads} />
        <Route path="/funnel" component={SalesFunnel} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/metrics" component={Metrics} />
        <Route path="/sellers" component={Sellers} />
        <Route path="/departments" component={Departments} />
        <Route path="/labels" component={Labels} />
        <Route path="/settings" component={Settings} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route component={NotFound} />
      </Switch>
      <FloatingAI />
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-apple-text-4" />
      </div>
    )
  }

  return (
    <>
      {user ? <AppRouter /> : <Login />}
      <Toaster position="bottom-right" richColors />
    </>
  )
}
