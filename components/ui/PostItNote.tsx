import React from 'react'

export type PostItNoteVariant = 'clay' | 'brass' | 'ink' | 'smoked-glass'

export interface PostItNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PostItNoteVariant
  /**
   * Optional manual rotation to enhance the organic look of a physical scrapbook.
   */
  rotation?: 'left' | 'right' | 'slight-left' | 'slight-right' | 'none'
  /**
   * Whether to hide the translucent tape visual overlay at the top.
   */
  hideTape?: boolean
}

export default function PostItNote({
  variant = 'clay',
  rotation = 'none',
  hideTape = false,
  children,
  className = '',
  style,
  ...props
}: PostItNoteProps) {
  // Map rotation values to Tailwind rotation classes
  const rotationClasses = {
    left: '-rotate-2',
    right: 'rotate-2',
    'slight-left': '-rotate-1',
    'slight-right': 'rotate-1',
    none: 'rotate-0',
  }

  // Variant classes mapping colors, borders, shadows, and text colors
  const variantClasses = {
    clay: 'bg-[#c27c65] text-[#2c130b] border-t border-l border-[#d3947f] border-b border-r border-[#a15f4a] shadow-[4px_12px_24px_-4px_rgba(44,19,11,0.4),_0_4px_8px_-2px_rgba(44,19,11,0.2)]',
    brass: 'bg-[#cfad67] text-[#302206] border-t border-l border-[#dbbd81] border-b border-r border-[#b3914a] shadow-[4px_12px_24px_-4px_rgba(48,34,6,0.4),_0_4px_8px_-2px_rgba(48,34,6,0.2)]',
    ink: 'bg-[#22252c] text-[#e3ded5] border border-[#313742] shadow-[4px_12px_28px_-4px_rgba(0,0,0,0.6),_0_4px_10px_-2px_rgba(0,0,0,0.4)]',
    'smoked-glass': 'bg-[#1b191a]/80 backdrop-blur-md text-[#eae5de] border border-[#3a3436]/60 shadow-[0_12px_32px_rgba(0,0,0,0.5)]',
  }

  return (
    <div
      className={`relative p-6 font-handwritten rounded-sm transition-transform duration-300 ease-out hover:scale-[1.02] ${rotationClasses[rotation]} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      {/* Translucent "tape" overlay */}
      {!hideTape && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/20 backdrop-blur-[1px] border-x border-dashed border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] pointer-events-none rotate-[-1.5deg] z-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          }}
        />
      )}

      {/* Subtly simulated paper fiber / lighting overlay for non-glass notes */}
      {variant !== 'smoked-glass' && (
        <div className="absolute inset-0 pointer-events-none rounded-sm bg-gradient-to-br from-white/10 via-transparent to-black/15 mix-blend-overlay z-0" />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 leading-relaxed text-lg sm:text-xl font-medium tracking-wide">
        {children}
      </div>
    </div>
  )
}
