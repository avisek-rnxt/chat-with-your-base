'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { motion } from 'motion/react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

export function Greeting({ user }: { user: User }) {
  const [greeting, setGreeting] = useState('')
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || ''

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  if (!greeting) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center py-20"
    >
      <h1 className="text-3xl font-semibold text-foreground mb-2">
        {greeting}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Ask anything about your database
      </p>
    </motion.div>
  )
}
