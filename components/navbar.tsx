'use client'

import Link from 'next/link'
import { logoutAction } from '@/actions/logout'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { useAppState } from '@/state'
import { SidebarTrigger } from './ui/sidebar'
import { ChatName } from './chat-name'
import { LogOut } from 'lucide-react'

export default function Navbar({ user }: { user: User }) {
  const chat = useAppState((s) => s.chat)

  return (
    <nav className="w-full px-4 py-3 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        {chat && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <ChatName id={chat.id} initialName={chat.name} />
          </div>
        )}
      </div>

      {user ? (
        <form
          action={async () => {
            await logoutAction()
          }}
        >
          <SubmitButton
            variant="ghost"
            pendingText="..."
            className="text-muted-foreground hover:text-foreground gap-2 text-sm"
          >
            <LogOut size={14} />
            Logout
          </SubmitButton>
        </form>
      ) : (
        <Link href="/login">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Login
          </Button>
        </Link>
      )}
    </nav>
  )
}
