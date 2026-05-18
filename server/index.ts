import express from 'express'
import cors from 'cors'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import 'dotenv/config'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// AI chat endpoint — uses Anthropic Claude API
app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    context?: { contacts: number; leads: number; conversations: number; totalSales: number; pipeline: number }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' })
  }

  const systemPrompt = `Você é um assistente de vendas inteligente para a plataforma Sales AI. Responda sempre em português do Brasil de forma concisa e profissional.

${context ? `Dados atuais do CRM:
- Contatos cadastrados: ${context.contacts}
- Leads no pipeline: ${context.leads}
- Conversas ativas: ${context.conversations}
- Total em vendas (fechadas): R$ ${context.totalSales.toLocaleString('pt-BR')}
- Pipeline total (aberto): R$ ${context.pipeline.toLocaleString('pt-BR')}` : ''}

Ajude com estratégias de vendas, análise de pipeline, dicas de follow-up, gestão de clientes e qualquer outra questão comercial.`

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')
    return res.json({ content: content.text })
  } catch (err) {
    console.error('AI error:', err)
    return res.status(500).json({ error: 'Erro ao processar resposta da IA.' })
  }
})

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')))
}

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
