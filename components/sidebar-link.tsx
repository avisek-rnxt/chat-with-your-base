'use client'

import { Link } from 'next-view-transitions'
import { SidebarMenuSubButton } from './ui/sidebar'
import { usePathname } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

export function SidebarLink(chat: { id: string; title: string }) {
  const pathname = usePathname()
  const isActive = pathname.includes(chat.id)

  return (
    <SidebarMenuSubButton
      asChild
      className={`p-1.5 rounded-md transition-all duration-200 group relative ${
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      <Link href={`/app/${chat.id}`} className="w-full h-full flex items-center gap-2" prefetch={true}>
        <MessageSquare size={12} className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
        <span className="truncate text-xs">{chat.title}</span>
      </Link>
    </SidebarMenuSubButton>
  )
}
