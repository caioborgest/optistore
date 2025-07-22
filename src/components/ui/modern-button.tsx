import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modernButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:-translate-y-0.5",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5",
        secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:-translate-y-0.5",
        warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg hover:-translate-y-0.5",
        gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 hover:shadow-xl hover:-translate-y-1",
        glass: "glass text-gray-900 hover:bg-white/20 hover:shadow-lg hover:-translate-y-0.5"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl"
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        glow: "hover-glow"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    },
  }
)

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, animation, asChild = false, loading = false, icon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    )
  }
)
ModernButton.displayName = "ModernButton"

export { ModernButton, modernButtonVariants }