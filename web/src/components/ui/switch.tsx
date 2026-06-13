import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch开关组件
 * 基于@radix-ui/react-switch封装，提供自定义样式和尺寸支持
 */
function Switch({
  className,
  size = "default",
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root> & {
  size?: "sm" | "default"
}) {
  const sizeClasses = {
    'default': 'h-[18.4px] w-[32px]',
    'sm': 'h-[14px] w-[24px]'
  };
  const thumbSizeClasses = {
    'default': 'size-4',
    'sm': 'size-3'
  };
  const translateX = checked ? `calc(100% - 2px)` : '0';

  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        checked ? "bg-primary" : "bg-input dark:bg-input/80",
        sizeClasses[size],
        className
      )}
      checked={checked}
      {...props}
    >
      <SwitchPrimitives.Thumb
        data-slot="switch-thumb"
        style={{ transform: `translateX(${translateX})` }}
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform dark:bg-background",
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
