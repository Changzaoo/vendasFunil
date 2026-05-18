import { useLocation } from 'wouter'
import { Shell } from '@/components/Shell'

export default function NotFound() {
  const [, navigate] = useLocation()
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-7xl font-bold text-apple-gray-4 mb-4">404</p>
        <h1 className="text-xl font-semibold text-apple-text mb-2">Página não encontrada</h1>
        <p className="text-sm text-apple-text-4 mb-6">A página que você está procurando não existe.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Voltar ao Dashboard</button>
      </div>
    </Shell>
  )
}
