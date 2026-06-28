'use client'

import { useEffect, useRef, useState } from 'react'

export default function InspiredByCounter() {
  const [count, setCount] = useState<number | null>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    fetch('/api/inspired-by-count')
      .then(res => res.json())
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => setCount(null))
  }, [])

  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (count === null || animatedRef.current) return
    animatedRef.current = true

    const duration = 300
    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      setDisplayed(Math.round(eased * count))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [count])

  if (count === null) return null

  return (
    <p style={{ color: 'var(--accent)', textAlign: 'center', fontSize: 13, marginTop: 8 }}>
      {displayed.toLocaleString()} Inspired By alternatives in our catalogue
    </p>
  )
}
