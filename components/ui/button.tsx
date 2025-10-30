import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Purple theme
        // default: medium purple solid with clear hover and accessible foreground
        default:
          "bg-[#75619D] text-[#E6EFF7] hover:bg-[#3F2A52] focus-visible:ring-[#75619D]/50 dark:bg-[#75619D] dark:hover:bg-[#3F2A52] dark:text-[#E6EFF7]",
        // keep destructive semantics but ensure visibility
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // outline: subtle border with hover fill from pastel purple
        outline:
          "border border-[#75619D] text-[#3A2D34] bg-background shadow-xs hover:bg-[#BEAEDB]/30 hover:text-[#3A2D34] dark:border-[#BEAEDB] dark:text-[#E6EFF7] dark:hover:bg-[#3F2A52]",
        // secondary: pastel background, hover to primary for visibility
        secondary:
          "bg-[#BEAEDB] text-[#3A2D34] hover:bg-[#75619D] hover:text-[#E6EFF7] dark:bg-[#3F2A52] dark:text-[#E6EFF7] dark:hover:bg-[#75619D]",
        // ghost: only hover surface, ensure it stays visible
        ghost:
          "text-[#3F2A52] hover:bg-[#BEAEDB]/30 hover:text-[#3F2A52] dark:text-[#E6EFF7] dark:hover:bg-[#3F2A52]/60",
        // link: purple text with underline on hover
        link: "text-[#75619D] underline-offset-4 hover:underline hover:text-[#3F2A52] dark:text-[#BEAEDB] dark:hover:text-[#E6EFF7]",
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
