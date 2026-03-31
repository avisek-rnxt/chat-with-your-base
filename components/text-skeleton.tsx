'use client'
import React from 'react'

import { motion } from 'motion/react'

export default function TextSkeleton({ maxRows = 3 }: { maxRows?: number }) {
  const fakeArray = Array.from({ length: maxRows }, (_, i) => i)
  return (
    <div className="space-y-3 py-2">
      {fakeArray.map((_, index) => {
        const isLast = index === fakeArray.length - 1
        return (
          <motion.div
            key={index}
            className="h-3 rounded-full shimmer"
            transition={{ duration: 0.4, delay: index * 0.15 }}
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: isLast ? '55%' : index === 0 ? '90%' : '75%',
              opacity: 1,
            }}
          />
        )
      })}
    </div>
  )
}
