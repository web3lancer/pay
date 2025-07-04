'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'indigo'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const base =
    "rounded-2xl backdrop-blur-lg glassmorphism-card";
  const variants = {
    default: "bg-white/60 border border-white/30 shadow-xl shadow-indigo-500/20",
    indigo: "bg-gradient-to-br from-indigo-500/70 via-indigo-600/60 to-indigo-700/70 border border-indigo-300/30 shadow-xl shadow-indigo-600/30",
  }
  return (
    <div
      className={cn(
        base,
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-neutral-200", className)}
      {...props}
    />
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-neutral-900", className)}
      {...props}
    />
  )
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn("mt-1 text-sm text-neutral-500", className)}
      {...props}
    />
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      className={cn("px-6 py-5", className)}
      {...props}
    />
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-neutral-200 bg-neutral-50", className)}
      {...props}
    />
  )
}