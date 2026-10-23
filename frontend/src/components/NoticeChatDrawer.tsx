import React, { useState } from 'react'
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
} from 'lucide-react'
import type { NoticeAnalysisResponse, ChatMessage } from '../types'

interface NoticeChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  notice: NoticeAnalysisResponse
}

export const NoticeChatDrawer: React.FC<NoticeChatDrawerProps> = ({
  isOpen,
  onClose,
  notice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I've read "${notice.title}". Ask me any specific questions about deadlines, eligibility, venue, or required documents!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  if (!isOpen) return null

  // Fast, accurate answers grounded in notice data
  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase()

    if (q.includes('deadline') || q.includes('last date') || q.includes('when to submit')) {
      return `The registration/submission deadline is: "${notice.registration_deadline}". ${
        notice.is_deadline_certain
          ? 'This is explicitly confirmed in the circular.'
          : 'Note: The date is tentative or marked as ambiguous. Verify with the department.'
      }`
    }

    if (q.includes('event date') || q.includes('when') || q.includes('timing') || q.includes('date of event')) {
      return `The event/session takes place on: "${notice.event_date || 'Date not explicitly specified'}". Venue: ${notice.location || 'Not stated'}.`
    }

    if (q.includes('eligible') || q.includes('eligibility') || q.includes('who can') || q.includes('year') || q.includes('branch')) {
      if (notice.eligibility && notice.eligibility.length > 0) {
        return `Eligibility rules:\n• ` + notice.eligibility.join('\n• ')
      }
      return 'No specific eligibility restrictions were found in the notice text.'
    }

    if (q.includes('document') || q.includes('bring') || q.includes('carry') || q.includes('id card') || q.includes('fee')) {
      if (notice.required_documents && notice.required_documents.length > 0) {
        return `Required documents and items:\n• ` + notice.required_documents.join('\n• ')
      }
      return 'No special documents or physical items are listed as mandatory.'
    }

    if (q.includes('action') || q.includes('what should i do') || q.includes('steps') || q.includes('how to register')) {
      if (notice.action_checklist && notice.action_checklist.length > 0) {
        return `Recommended action steps:\n` +
          notice.action_checklist.map((item, idx) => `${idx + 1}. ${item.task}${item.deadline ? ` (Due: ${item.deadline})` : ''}`).join('\n')
      }
      return 'No specific multi-step checklist was identified.'
    }

    if (q.includes('summary') || q.includes('whatsapp') || q.includes('short') || q.includes('overview')) {
      return `📌 *${notice.title}*\n📝 Summary: ${notice.simple_summary}\n📅 Event: ${notice.event_date || 'N/A'}\n⏰ Deadline: ${notice.registration_deadline}\n📍 Location: ${notice.location || 'N/A'}`
    }

    // Default synthesized answer
    return `Regarding "${query}": Based on the circular text, ${notice.simple_summary} For further clarification, refer to the source evidence quotes or contact your department admin.`
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const currentQuery = input.trim()
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const answer = generateAnswer(currentQuery)
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 450)
  }

  const handleSuggestedPrompt = (promptText: string) => {
    setInput(promptText)
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">Notice Assistant Q&A</h4>
            <p className="text-[10px] text-slate-300 truncate max-w-[200px]">
              {notice.title}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          type="button"
          onClick={() => handleSuggestedPrompt('Am I eligible?')}
          className="px-2.5 py-1 bg-white hover:bg-violet-50 hover:text-violet-700 text-slate-600 rounded-lg border border-slate-200 whitespace-nowrap font-medium transition"
        >
          Eligibility?
        </button>
        <button
          type="button"
          onClick={() => handleSuggestedPrompt('What documents do I need?')}
          className="px-2.5 py-1 bg-white hover:bg-violet-50 hover:text-violet-700 text-slate-600 rounded-lg border border-slate-200 whitespace-nowrap font-medium transition"
        >
          Documents?
        </button>
        <button
          type="button"
          onClick={() => handleSuggestedPrompt('Summarize for WhatsApp')}
          className="px-2.5 py-1 bg-white hover:bg-violet-50 hover:text-violet-700 text-slate-600 rounded-lg border border-slate-200 whitespace-nowrap font-medium transition"
        >
          Share Summary
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[82%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-violet-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-violet-500" />
            <span>Consulting circular knowledge...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this notice..."
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
