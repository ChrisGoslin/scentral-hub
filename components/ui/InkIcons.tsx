import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

function baseProps(size = 22): IconProps {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
}

export function ReadInkIcon(props: IconProps) {
  return (
    <svg {...baseProps(props.size)} {...props}>
      <path d="M6 5.5c2.2-1.2 4.4-1.5 6 .2 1.6-1.7 3.8-1.4 6-.2v13c-2.2-1.1-4.4-1.3-6 .4-1.6-1.7-3.8-1.5-6-.4z" />
      <path d="M12 6.3v12.1" />
      <path d="M8.2 8.2c1.3-.5 2.5-.6 3.8-.2" opacity="0.55" />
    </svg>
  )
}

export function NoseprintInkIcon(props: IconProps) {
  return (
    <svg {...baseProps(props.size)} {...props}>
      <path d="M12 4.2c2.1 0 3.8 1.7 3.8 3.8 0 1.2-.5 2.1-1.1 2.9-.6.7-1 1.5-1 2.4 0 1.3.9 2.4 2.1 2.7" />
      <path d="M9.5 8.2c.5-1.2 1.4-2 2.5-2" opacity="0.55" />
      <path d="M7.1 15.8c1.8-1 3.5-1.4 4.9-1.4 1.5 0 3.2.4 5 1.4" />
      <path d="M5.9 19c1.8-1 3.7-1.5 6.1-1.5 2.3 0 4.2.5 6.1 1.5" opacity="0.75" />
    </svg>
  )
}

export function ShelfInkIcon(props: IconProps) {
  return (
    <svg {...baseProps(props.size)} {...props}>
      <path d="M5 7.2h14" />
      <path d="M7.4 7.2v10.8" />
      <path d="M12 7.2v10.8" />
      <path d="M16.6 7.2v10.8" />
      <path d="M5.8 17.8h12.4" opacity="0.55" />
    </svg>
  )
}

export function TracesInkIcon(props: IconProps) {
  return (
    <svg {...baseProps(props.size)} {...props}>
      <path d="M6 6.5c1.8 1.4 3.5 2.1 6 2.1s4.2-.7 6-2.1" />
      <path d="M6 12c1.8 1.4 3.5 2.1 6 2.1s4.2-.7 6-2.1" opacity="0.8" />
      <path d="M6 17.5c1.8 1.4 3.5 2.1 6 2.1s4.2-.7 6-2.1" opacity="0.55" />
    </svg>
  )
}

export function YouInkIcon(props: IconProps) {
  return (
    <svg {...baseProps(props.size)} {...props}>
      <path d="M12 12.2c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z" />
      <path d="M5.8 19c.8-2.7 3.1-4.4 6.2-4.4s5.4 1.7 6.2 4.4" />
    </svg>
  )
}
