'use client'

import React, { useCallback, useRef, useState } from 'react'
import { FlipWords } from './flipping-words'
import { motion } from 'motion/react'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp } from 'lucide-react'

type Props = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Form({ onChange, onSubmit, value }: Props) {
  const [focused, setFocused] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const submit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!value) return

      if (!conversationStarted) {
        setConversationStarted(true)
      }
      onSubmit(e)
      inputRef.current?.focus()
    },
    [value, conversationStarted, onSubmit]
  )

  const animationRef = useRef<HTMLDivElement | null>(null)

  const searchs = [
    'How can I optimize this query?',
    'Show me my database stats',
    'Which indexes are unused?',
    'Count users from the last 30 days',
  ]

  const handleResize = useCallback(() => {
    if (animationRef.current && inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 124)}px`

      if (
        Math.abs(
          animationRef.current.offsetHeight - inputRef.current.offsetHeight
        ) > 10
      ) {
        animationRef.current.style.height = `${inputRef.current.offsetHeight - 10}px`
      }
    }
  }, [animationRef, inputRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(e as any)
    handleResize()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative">
      <div className="relative">
        {value || conversationStarted ? null : (
          <div className="absolute left-4 top-4 pointer-events-none text-muted-foreground/60 text-sm">
            <FlipWords words={searchs} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: focused ? 1 : 0,
            scale: focused ? 1 : 0.98,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(166 76% 46% / 0.06), hsl(198 70% 50% / 0.04))',
          }}
          ref={animationRef}
        />

        <div className="relative">
          <Textarea
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            ref={inputRef}
            onChange={(e) => {
              onChange(e)
              handleResize()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={
              conversationStarted ? 'Ask anything about your database...' : ''
            }
            value={value}
            className="resize-none w-full p-4 pr-14 rounded-xl min-h-[56px] bg-card/80 border border-border/60 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            disabled={!value}
            className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </form>
  )
}
