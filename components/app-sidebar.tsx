import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { NewChatSidebar } from './new-chat-sidebar'
import { AppSidebarItems } from './app-sidebar-items'

async function Items() {
  const client = await createClient()

  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user) {
    return redirect('/login')
  }

  const { data: chats } = await client
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!chats) {
    return null
  }

  return <AppSidebarItems chats={chats} />
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1">
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground tracking-tight">Bamboo Base</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupLabel className="my-1 px-2">
            <NewChatSidebar />
          </SidebarGroupLabel>

          <SidebarGroupContent className="flex flex-col gap-2 max-h-[50%] overflow-y-auto">
            <SidebarMenu>
              <Suspense
                fallback={
                  <>
                    {/* Today's chats skeleton */}
                    <SidebarMenuItem>
                      <SidebarGroupLabel>
                        <div className="w-16 h-6 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                      </SidebarGroupLabel>
                      <SidebarMenuSub>
                        {Array(3)
                          .fill(null)
                          .map((_, index) => (
                            <SidebarMenuSubItem key={`today-${index}`}>
                              <div className="flex items-center gap-2 w-full p-2">
                                <div className="w-5 h-5 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                                <div className="flex-1 h-4 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>

                    {/* Yesterday's chats skeleton */}
                    <SidebarMenuItem>
                      <SidebarGroupLabel>
                        <div className="w-20 h-6 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                      </SidebarGroupLabel>
                      <SidebarMenuSub>
                        {Array(2)
                          .fill(null)
                          .map((_, index) => (
                            <SidebarMenuSubItem key={`yesterday-${index}`}>
                              <div className="flex items-center gap-2 w-full p-2">
                                <div className="w-5 h-5 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                                <div className="flex-1 h-4 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>

                    {/* Past chats skeleton */}
                    <SidebarMenuItem>
                      <SidebarGroupLabel>
                        <div className="w-12 h-6 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                      </SidebarGroupLabel>
                      <SidebarMenuSub>
                        {Array(2)
                          .fill(null)
                          .map((_, index) => (
                            <SidebarMenuSubItem key={`past-${index}`}>
                              <div className="flex items-center gap-2 w-full p-2">
                                <div className="w-5 h-5 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                                <div className="flex-1 h-4 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </>
                }
              >
                <Items />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
