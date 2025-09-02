interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "full" | "icon"
}

export function Logo({ className = "", size = "md", variant = "full" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wings Logo - Upside down V shape */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Left wing */}
          <path
            d="M4 8C4 8 8 12 12 16L16 20L20 16C24 12 28 8 28 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
          {/* Wing details for depth */}
          <path
            d="M6 10C6 10 9 13 12 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary/70"
          />
          <path
            d="M26 10C26 10 23 13 20 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary/70"
          />
          {/* Center point highlight */}
          <circle cx="16" cy="20" r="2" fill="currentColor" className="text-accent" />
        </svg>
      </div>

      {variant === "full" && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-foreground ${textSizeClasses[size]}`}>
            WeAre<span className="text-primary">JobPilot</span>
          </span>
          {size === "lg" || size === "xl" ? (
            <span className="text-xs text-muted-foreground font-medium tracking-wide">Your Career Navigator</span>
          ) : null}
        </div>
      )}
    </div>
  )
}
