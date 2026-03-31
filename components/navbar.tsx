'use client'

import Link from 'next/link'
import { logoutAction } from '@/actions/logout'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { AnimatePresence } from 'motion/react'
import { useAppState } from '@/state'
import { SidebarTrigger } from './ui/sidebar'
import { ChatName } from './chat-name'
export default function Navbar({ user }: { user: User }) {
  const chat = useAppState((s) => s.chat)

  return (
    <AnimatePresence>
      <nav className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {chat && <ChatName id={chat.id} initialName={chat.name} />}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <form
              action={async () => {
                await logoutAction()
              }}
            >
              <SubmitButton variant="ghost" pendingText="Logging out...">
                Logout
              </SubmitButton>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
    </AnimatePresence>
  )
}
