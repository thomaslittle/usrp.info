"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex h-auto items-center justify-center rounded-2xl bg-slate-800/60 p-2 text-muted-foreground backdrop-blur-sm border border-white/10",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false)
  const elementRef = React.useRef<HTMLButtonElement | null>(null)

  React.useImperativeHandle(ref, () => elementRef.current!)

  React.useEffect(() => {
    // Radix UI uses a `data-state` attribute to indicate the active tab.
    // We can use a MutationObserver to watch for changes to this attribute.
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const newState = (mutation.target as HTMLElement).getAttribute(
            "data-state"
          )
          setIsActive(newState === "active")
        }
      })
    })

    if (elementRef.current) {
      observer.observe(elementRef.current, { attributes: true })
      // Set initial state
      setIsActive(elementRef.current.getAttribute("data-state") === "active")
    }

    return () => observer.disconnect()
  }, [])

  return (
    <TabsPrimitive.Trigger
      ref={elementRef}
      className={cn(
        "relative z-10 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl px-6 text-lg font-semibold text-slate-300 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-white",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      <span className="relative z-20">{children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
