'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput({
  id,
  name,
  placeholder,
  required,
  minLength,
  className,
}: {
  id: string
  name: string
  placeholder?: string
  required?: boolean
  minLength?: number
  className?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
