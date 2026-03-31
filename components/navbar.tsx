'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { useAppState } from '@/state'
import { SidebarTrigger } from './ui/sidebar'
import { ChatName } from './chat-name'
import { ProfileMenu } from './profile-menu'

export default function Navbar({ user }: { user: User }) {
  const chat = useAppState((s) => s.chat)

  return (
    <nav className="w-full px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        {chat && <ChatName id={chat.id} initialName={chat.name} />}
      </div>

      {user ? (
        <ProfileMenu user={user} />
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
