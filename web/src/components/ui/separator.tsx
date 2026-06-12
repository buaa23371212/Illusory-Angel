'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}) {
  const ariaOrientation = orientation === 'vertical' ? 'vertical' : undefined
  const propsToPass: React.HTMLAttributes<HTMLDivElement> = decorative
    ? { role: 'none', ...(ariaOrientation && { 'aria-orientation': ariaOrientation as any }), ...props }
    : { ...(ariaOrientation && { 'aria-orientation': ariaOrientation as any }), ...props }

  return (
    <div
      data-slot="separator"
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...propsToPass}
    />
  )
}

export { Separator }