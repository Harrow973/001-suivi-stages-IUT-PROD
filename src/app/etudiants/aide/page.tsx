'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Loader2, Bot, User, AlertCircle, HelpCircle } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AidePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant virtuel de l\'IUT de la Martinique (https://iut-martinique.univ-antilles.fr/). Je peux vous aider avec vos questions sur les stages, les conventions, la recherche d\'entreprises en Martinique, ou toute autre question liée aux stages à l\'IUT de la Martinique.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Construire l'historique pour Groq (sans le message système)
      const history = messages
        .filter(m => m.role !== 'assistant' || !m.content.includes('Bonjour ! Je suis votre assistant virtuel'))
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: history
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Erreur:', err)
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      
      // Ajouter un message d'erreur
      const errorMsg: Message = {
        role: 'assistant',
        content: `Désolé, je n'ai pas pu traiter votre demande. ${errorMessage.includes('service de chat n\'est pas disponible') ? 'Le service de chat n\'est pas disponible actuellement. Veuillez réessayer plus tard.' : 'Veuillez réessayer.'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Bonjour ! Je suis votre assistant virtuel de l\'IUT de la Martinique (https://iut-martinique.univ-antilles.fr/). Je peux vous aider avec vos questions sur les stages, les conventions, la recherche d\'entreprises en Martinique, ou toute autre question liée aux stages à l\'IUT de la Martinique.',
        timestamp: new Date()
      }
    ])
    setError(null)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Besoin d&apos;aide
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Posez vos questions sur les stages à l&apos;IUT de la Martinique et obtenez des réponses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearChat}>
            Nouvelle conversation
          </Button>
          <Button variant="outline" asChild>
            <Link href="/etudiants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>

      {/* Zone de chat */}
      <Card className="flex-1 flex flex-col min-h-[500px] max-h-[calc(100vh-300px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistant virtuel
          </CardTitle>
          <CardDescription>
            Je peux vous aider avec vos questions sur les stages à l&apos;IUT de la Martinique, les conventions, la recherche d&apos;entreprises en Martinique, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <div className="border-t p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Posez votre question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions de questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              'Comment trouver un stage ?',
              'Quelles sont les démarches pour une convention de stage ?',
              'Comment rédiger une lettre de motivation ?',
              'Quand dois-je commencer à chercher un stage ?',
              'Quels documents sont nécessaires pour un stage ?',
              'Comment contacter les référents de stage ?'
            ].map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => {
                  setInput(question)
                  inputRef.current?.focus()
                }}
                disabled={loading}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

