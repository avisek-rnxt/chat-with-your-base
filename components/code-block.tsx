'use client'

import { Check, Copy, BarChart3 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { runSql } from '@/actions/run-sql'
import { toast } from '@/hooks/use-toast'
import { DynamicChart } from '@/components/dynamic-chart'
import { generateChartConfig } from '@/actions/chart'
import type { Config, Result } from '@/lib/chart'

import type { QueryResult } from 'pg'
import SqlResult from './sql-result'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-okaidia.css'

const convertToResult = (rows: unknown[]): Result[] => {
  return rows.map((row) => {
    if (typeof row === 'object' && row !== null) {
      return Object.entries(row).reduce((acc, [key, value]) => {
        acc[key] = value as string | number
        return acc
      }, {} as Result)
    }
    throw new Error('Invalid row data')
  })
}

function CodeBlock({
  children,
  language,
  sqlResult,
  setSqlResult,
  isDisabled,
}: {
  children: React.ReactNode
  language?: string
  sqlResult?: QueryResult<unknown[]> | string
  setSqlResult: (result: QueryResult<unknown[]> | string) => void
  isDisabled?: boolean
}) {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  const [copied, setCopied] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [chartConfig, setChartConfig] = useState<Config | null>(null)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const hasAutoRun = useRef(false)

  // Auto-run SQL queries once streaming is done
  useEffect(() => {
    if (
      language === 'sql' &&
      children &&
      !hasAutoRun.current &&
      !sqlResult &&
      !isDisabled
    ) {
      hasAutoRun.current = true
      const run = async () => {
        setIsLoading(true)
        const result = await runSql(children.toString())
        try {
          const parsedResult = JSON.parse(result)
          setSqlResult?.(parsedResult)
        } catch {
          setSqlResult?.(result)
        }
        setIsLoading(false)
      }
      run()
    }
  }, [language, children, sqlResult, isDisabled])

  const copyToClipboard = async () => {
    try {
      navigator.clipboard.writeText(children as string)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to copy to clipboard', error)
    }
  }

  const handleShowChart = async () => {
    if (!sqlResult || typeof sqlResult === 'string') return

    setIsChartLoading(true)
    try {
      const rows = convertToResult(sqlResult.rows)
      const { config } = await generateChartConfig(
        rows,
        children?.toString() || ''
      )
      setChartConfig(config)
      setShowChart(true)
    } catch (error) {
      toast({
        title: 'Error generating chart',
        description: 'Could not generate a chart for this data',
        variant: 'destructive',
      })
    }
    setIsChartLoading(false)
  }

  // Inline code (non-SQL short strings)
  if (
    language !== 'sql' &&
    typeof children === 'string' &&
    children.length < 40
  ) {
    return (
      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono border border-primary/10">
        {children}
      </span>
    )
  }

  // SQL blocks: hide the code, only show loading/results
  if (language === 'sql') {
    return (
      <div className="flex flex-col my-4 gap-3">
        {isLoading || (isDisabled && !sqlResult) ? (
          <div className="w-full h-16 rounded-lg shimmer" />
        ) : sqlResult ? (
          <>
            <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
              <SqlResult result={sqlResult} />
            </div>
            {typeof sqlResult !== 'string' && sqlResult.rows?.length > 0 && (
              <>
                {!showChart && (
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    onClick={handleShowChart}
                    disabled={isChartLoading}
                    className="flex items-center gap-2 text-xs w-fit border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Visualize
                  </Button>
                )}
                {showChart && chartConfig && (
                  <div className="mt-2 rounded-lg border border-border/60 p-4 bg-card/40">
                    <DynamicChart
                      chartData={convertToResult(sqlResult.rows)}
                      chartConfig={chartConfig}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    )
  }

  // Non-SQL code blocks: show normally
  return (
    <div className="flex flex-col my-4 gap-2">
      <div className="relative group rounded-lg overflow-hidden border border-border/40">
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/60 hover:border-primary/40 transition-colors"
          >
            {copied ? (
              <Check size={13} className="text-primary" />
            ) : (
              <Copy size={13} className="text-muted-foreground" />
            )}
          </button>
        </div>
        <pre className="!bg-card/60 !text-foreground/90 w-full !p-4 text-xs rounded-lg overflow-auto">
          <code className={`language-${language ?? 'markup'}`}>{children}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
