import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  showLabels?: boolean
  compact?: boolean
  className?: string
}

export const ThemeToggle = ({ showLabels = false, compact = false, className }: ThemeToggleProps) => {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  if (compact) {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    const Icon = theme === 'light' ? Sun : Moon

    return (
      <button
        type="button"
        aria-label={`Switch to ${nextTheme} mode`}
        title={`${theme === 'light' ? 'Light' : 'Dark'} mode · click to switch to ${nextTheme}`}
        onClick={toggleTheme}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/15 bg-surface-alt text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          theme === 'light' && 'text-brand-muted',
          className
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn('inline-flex items-center gap-0.5 rounded-xl border border-border/20 bg-surface-alt p-1 shadow-sm', className)}
    >
      {([
        { value: 'light', label: 'Light', Icon: Sun },
        { value: 'dark', label: 'Dark', Icon: Moon },
      ] as const).map(({ value, label, Icon }) => {
        const active = theme === value

        return (
          <button
            key={value}
            type="button"
            aria-label={`${label} mode`}
            aria-pressed={active}
            title={`${label} mode`}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-2 rounded-lg px-2.5 text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
              active
                ? 'bg-primary-500 text-[#11141b] shadow-sm ring-1 ring-primary-600/20'
                : 'text-muted-foreground hover:bg-hover/[0.06] hover:text-foreground-strong',
              !showLabels && 'w-8 px-0'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {showLabels && <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
