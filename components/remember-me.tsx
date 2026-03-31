'use client'

import { useState } from 'react'

export function RememberMe() {
  const [checked, setChecked] = useState(false)

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        name="rememberMe"
        value="true"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="sr-only peer"
      />
      <div className="w-4 h-4 rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-xs text-muted-foreground">Remember me</span>
    </label>
  )
}
