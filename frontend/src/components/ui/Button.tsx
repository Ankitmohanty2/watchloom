import { ButtonHTMLAttributes, CSSProperties, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, ...props }, ref) => {
    const buttonStyle: CSSProperties = variant === 'primary'
      ? { backgroundColor: '#FFD93D', color: '#11141b', ...style }
      : style || {}

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          {
            'bg-primary-500 text-[#11141b] hover:bg-primary-400': variant === 'primary',
            'bg-hover/[0.08] text-foreground-strong hover:bg-hover/[0.12]': variant === 'secondary',
            'border border-border/15 text-foreground hover:border-border/30 hover:bg-hover/[0.05]': variant === 'outline',
            'text-muted hover:bg-hover/[0.06] hover:text-foreground-strong': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        style={buttonStyle}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
