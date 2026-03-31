'use client'

import { logoutAction } from '@/actions/logout'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'

export function ProfileMenu({ user }: { user: User }) {
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const email = user.email || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || email.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
            {initials}
          </div>
          <span className="hidden sm:inline">
            {firstName || email.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              {(firstName || lastName) && (
                <p className="text-sm font-medium truncate">
                  {firstName} {lastName}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-1">
          <form
            action={async () => {
              await logoutAction()
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
