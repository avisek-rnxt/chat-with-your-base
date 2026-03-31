'use client'

import { useChat } from '@ai-sdk/react'

import { useRef, useCallback, useMemo, useState, useEffect, memo } from 'react'
import { motion } from 'motion/react'
import { Form } from './form'
import TextSkeleton from './text-skeleton'
import Markdown from 'react-markdown'
import CodeBlock from './code-block'
import type { QueryResult } from 'pg'
import remarkGfm from 'remark-gfm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '../hooks/use-toast'
import Navbar from './navbar'
import { User } from '@supabase/supabase-js'
import { useAppState } from '../state'
import { usePathname } from 'next/navigation'

const toolCallToNameText = {
  getExplainForQuery: 'Getting query plan...',
  getForeignKeyConstraints: 'Fetching foreign key relationships...',
  getIndexes: 'Listing table indexes...',
  getIndexStatsUsage: 'Analyzing index usage...',
  getPublicTablesWithColumns: 'Retrieving public tables and columns...',
  getTableStats: 'Collecting table statistics...',
}

function ChatComponent({ initialId, user }: { initialId: string; user: User }) {
  const chat = useAppState((state) => state.chat)
  const updateChats = useAppState((state) => state.updateChats)
  const [isNewChat, setIsNewChat] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()
  const messagesChat = useRef<HTMLDivElement | null>(null)

  // Optimize scroll behavior with RAF
  const scrollMessagesToBottom = useCallback(() => {
    if (!messagesChat.current) return

    requestAnimationFrame(() => {
      messagesChat.current?.scrollTo({
        top: messagesChat.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  const shouldUpdateChats = useRef(false)

  const onFinish = useCallback(() => {
    scrollMessagesToBottom()

    if (shouldUpdateChats.current) {
      setIsNewChat(false)
      updateChats().catch((err) => {
        console.error(err)
      })
    }
  }, [isNewChat, scrollMessagesToBottom, updateChats])

  const onError = useCallback((error: Error) => {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    })
  }, [])

  const onResponse = useCallback((response: Response) => {
    if (response.headers.get('x-should-update-chats') === 'true') {
      shouldUpdateChats.current = true
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      headers: {},
      onFinish,
      streamProtocol: 'data',
      sendExtraMessageFields: true,
      id: initialId,
      initialMessages: chat?.messages ?? [],
      onError,
      onResponse,
    })

  // Cleanup SQL results when component unmounts
  useEffect(() => {
    return () => {
      setSqlResults({})
    }
  }, [])

  const showSkeleton = useMemo(() => {
    if (!messages.length) return false
    const lastMessageIsUser = messages[messages.length - 1]?.role === 'user'
    return isLoading && lastMessageIsUser
  }, [isLoading, messages])

  // New state to manage SQL results
  const [sqlResults, setSqlResults] = useState<{
    [key: string]: QueryResult<unknown[]> | string
  }>({})

  const handleSetSqlResult = useCallback(
    (messageId: string, result: QueryResult<unknown[]> | string) => {
      setSqlResults((prev) => ({
        ...prev,
        [messageId]: result,
      }))
    },
    []
  )

  const toolsLoading = useMemo(() => {
    const toolInvocation = messages[messages.length - 1]?.toolInvocations

    return (toolInvocation ?? []).filter((tool) => tool.state === 'call')
  }, [messages])

  return (
    <div className="flex-1 flex flex-col w-full">
      <Navbar user={user} />

      <div ref={messagesChat} className="flex-1 overflow-y-auto w-full scrollbar-thin">
        <div className="container mx-auto max-w-3xl h-full">
          <div className="px-6 py-8">
            <div className="w-full space-y-10">
              {messages.map((message, msgIndex) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  {message.role === 'user' ? (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-lg font-semibold text-foreground/90 pb-3 border-b border-primary/20"
                    >
                      {message.content}
                    </motion.div>
                  ) : (
                    <>
                      {message.parts && message.parts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="text-sm leading-relaxed prose prose-neutral dark:prose-invert max-w-none prose-p:text-foreground/80 prose-strong:text-foreground prose-headings:text-foreground"
                        >
                          {message.parts ? (
                            message.parts.map((part, index) => {
                              if (part.type === 'tool-invocation') {
                                return null
                              }

                              const content =
                                'text' in part ? part.text : part.reasoning

                              return (
                                <Markdown
                                  key={`${message.id}-part-${index}`}
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code: ({ className, children }) => {
                                      const language = className?.includes(
                                        'sql'
                                      )
                                        ? 'sql'
                                        : 'markup'
                                      return (
                                        <CodeBlock
                                          isDisabled={isLoading}
                                          language={language}
                                          sqlResult={
                                            sqlResults[
                                              `${children?.toString()}_${message.id}`
                                            ]
                                          }
                                          setSqlResult={(result) =>
                                            handleSetSqlResult(
                                              `${children?.toString()}_${message.id}`,
                                              result
                                            )
                                          }
                                        >
                                          {children}
                                        </CodeBlock>
                                      )
                                    },
                                    li: ({ children }) => (
                                      <li className="my-1">{children}</li>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc pl-4 my-1">
                                        {children}
                                      </ul>
                                    ),
                                    h1: ({ children }) => (
                                      <h1 className="text-2xl font-bold my-2">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-xl font-semibold my-1">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-lg font-medium my-1">
                                        {children}
                                      </h3>
                                    ),
                                    h4: ({ children }) => (
                                      <h4 className="text-base font-normal my-1">
                                        {children}
                                      </h4>
                                    ),
                                    h5: ({ children }) => (
                                      <h5 className="text-sm font-normal my-1">
                                        {children}
                                      </h5>
                                    ),
                                    h6: ({ children }) => (
                                      <h6 className="text-xs font-normal my-1">
                                        {children}
                                      </h6>
                                    ),
                                    table: ({ children }) => (
                                      <div className="my-3">
                                        <Table>{children}</Table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <TableHeader>{children}</TableHeader>
                                    ),
                                    tbody: ({ children }) => (
                                      <TableBody>{children}</TableBody>
                                    ),
                                    tr: ({ children }) => (
                                      <TableRow>{children}</TableRow>
                                    ),
                                    th: ({ children }) => (
                                      <TableHead>{children}</TableHead>
                                    ),
                                    td: ({ children }) => (
                                      <TableCell>{children}</TableCell>
                                    ),
                                  }}
                                >
                                  {content}
                                </Markdown>
                              )
                            })
                          ) : (
                            <Markdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ className, children }) => {
                                  const language = className?.includes('sql')
                                    ? 'sql'
                                    : 'markup'
                                  return (
                                    <CodeBlock
                                      isDisabled={isLoading}
                                      language={language}
                                      sqlResult={
                                        sqlResults[
                                          `${children?.toString()}_${message.id}`
                                        ]
                                      }
                                      setSqlResult={(result) =>
                                        handleSetSqlResult(
                                          `${children?.toString()}_${message.id}`,
                                          result
                                        )
                                      }
                                    >
                                      {children}
                                    </CodeBlock>
                                  )
                                },
                                li: ({ children }) => (
                                  <li className="my-1">{children}</li>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-4 my-1">
                                    {children}
                                  </ul>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-bold my-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold my-1">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-medium my-1">
                                    {children}
                                  </h3>
                                ),
                                h4: ({ children }) => (
                                  <h4 className="text-base font-normal my-1">
                                    {children}
                                  </h4>
                                ),
                                h5: ({ children }) => (
                                  <h5 className="text-sm font-normal my-1">
                                    {children}
                                  </h5>
                                ),
                                h6: ({ children }) => (
                                  <h6 className="text-xs font-normal my-1">
                                    {children}
                                  </h6>
                                ),
                                table: ({ children }) => (
                                  <div className="my-3">
                                    <Table>{children}</Table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <TableHeader>{children}</TableHeader>
                                ),
                                tbody: ({ children }) => (
                                  <TableBody>{children}</TableBody>
                                ),
                                tr: ({ children }) => (
                                  <TableRow>{children}</TableRow>
                                ),
                                th: ({ children }) => (
                                  <TableHead>{children}</TableHead>
                                ),
                                td: ({ children }) => (
                                  <TableCell>{children}</TableCell>
                                ),
                              }}
                            >
                              {message.content}
                            </Markdown>
                          )}
                        </motion.div>
                      )}
                      {(showSkeleton || toolsLoading.length > 0) &&
                        message.id === messages[messages.length - 1].id && (
                          <div className="mt-4 space-y-3">
                            {toolsLoading.map((tool) => {
                              const aiRunningText =
                                toolCallToNameText[
                                  tool.toolName as keyof typeof toolCallToNameText
                                ] ?? ''

                              return (
                                aiRunningText && (
                                  <motion.div
                                    key={tool.toolCallId}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-2 text-xs text-primary/70"
                                  >
                                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    <p>{aiRunningText}</p>
                                  </motion.div>
                                )
                              )
                            })}
                            <TextSkeleton />
                          </div>
                        )}
                    </>
                  )}
                </motion.div>
              ))}
              {showSkeleton && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 text-xs text-primary/70 mb-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p>Thinking...</p>
                  </div>
                  <TextSkeleton />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none border-t border-border/40 bg-background/60 backdrop-blur-md">
        <div className="container max-w-3xl mx-auto px-6 py-4">
          <Form
            onChange={handleInputChange}
            value={input}
            onSubmit={async (e) => {
              if (typeof window !== 'undefined') {
                if (pathname === '/app') {
                  try {
                    setIsNewChat(true)
                    window.history.pushState({}, '', `/app/${initialId}`)
                  } catch (error) {
                    console.error('Error pushing state:', error)
                  }
                }
              }
              handleSubmit(e)
              scrollMessagesToBottom()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatComponent
