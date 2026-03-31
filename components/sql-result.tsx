'use client'

import { QueryResult } from 'pg'
import { DataTable } from './table'

export default function SqlResult({
  result,
}: {
  result: QueryResult<unknown[]> | string
}) {
  if (typeof result === 'object' && 'fields' in result && 'rows' in result) {
    const headers = result.fields.map((field) => ({
      header: field.name,
      accessorKey: field.name,
    }))

    const processedRows = result.rows.map((row) => {
      const processedRow: Record<string, string> = {}
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'object' && value !== null) {
          processedRow[key] = JSON.stringify(value)
        } else {
          processedRow[key] = String(value)
        }
      }
      return processedRow
    })

    return (
      <div className="overflow-hidden">
        <DataTable columns={headers} data={processedRows} />
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground/50 border-t border-border/30 bg-muted/20">
          {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 text-sm text-destructive/80 bg-destructive/5 rounded-lg border border-destructive/20">
      <pre className="whitespace-pre-wrap text-xs">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
