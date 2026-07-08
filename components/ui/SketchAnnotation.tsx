import React from 'react'

export type SketchAnnotationColor = 'default' | 'gold' | 'clay' | 'brass' | 'muted'
export type ArrowDirection = 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'left' | 'right' | 'none'

export interface SketchAnnotationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Handwritten line/text color mapped to the design system.
   */
  color?: SketchAnnotationColor
  /**
   * Where to render the organic arrow relative to the text.
   */
  arrowPlacement?: 'before' | 'after' | 'top' | 'bottom'
  /**
   * The direction the hand-drawn style arrow points to.
   */
  arrowDirection?: ArrowDirection
  /**
   * Additional class names specifically for the SVG arrow element.
   */
  arrowClassName?: string
}

export default function SketchAnnotation({
  color = 'default',
  arrowPlacement = 'before',
  arrowDirection = 'none',
  arrowClassName = '',
  children,
  className = '',
  ...props
}: SketchAnnotationProps) {
  
  const colorClasses = {
    default: 'text-[var(--color-primary)]',
    gold: 'text-[var(--color-gold)]',
    clay: 'text-[#c27c65]',
    brass: 'text-[#cfad67]',
    muted: 'text-[var(--color-text-muted)]',
  }

  // Renders a sketchy, hand-drawn vector SVG arrow
  const renderArrow = () => {
    if (arrowDirection === 'none') return null

    let path = ''
    const viewBox = '0 0 50 50'
    
    switch (arrowDirection) {
      case 'down-left':
        path = 'M 40,5 C 28,8 15,22 8,42 M 8,42 L 5,32 M 8,42 L 18,39'
        break
      case 'down-right':
        path = 'M 10,5 C 22,8 35,22 42,42 M 42,42 L 32,39 M 42,42 L 45,32'
        break
      case 'up-left':
        path = 'M 40,45 C 28,42 15,28 8,8 M 8,8 L 18,11 M 8,8 L 5,18'
        break
      case 'up-right':
        path = 'M 10,45 C 22,42 35,28 42,8 M 42,8 L 45,18 M 42,8 L 32,11'
        break
      case 'left':
        path = 'M 45,25 C 32,22 18,22 5,25 M 5,25 L 14,18 M 5,25 L 13,32'
        break
      case 'right':
        path = 'M 5,25 C 18,22 32,22 45,25 M 45,25 L 37,32 M 45,25 L 36,18'
        break
    }

    return (
      <svg
        viewBox={viewBox}
        className={`w-8 h-8 shrink-0 select-none ${arrowClassName}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    )
  }

  const isVerticalPlacement = arrowPlacement === 'top' || arrowPlacement === 'bottom'
  const layoutClass = isVerticalPlacement 
    ? 'flex flex-col items-center text-center' 
    : 'flex items-center gap-2'

  return (
    <div
      className={`inline-flex font-handwritten select-none ${layoutClass} ${colorClasses[color]} ${className}`}
      {...props}
    >
      {(arrowPlacement === 'before' || arrowPlacement === 'top') && renderArrow()}
      <div className="leading-tight text-base sm:text-lg italic tracking-wide">
        {children}
      </div>
      {(arrowPlacement === 'after' || arrowPlacement === 'bottom') && renderArrow()}
    </div>
  )
}
