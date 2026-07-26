'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { decode } from 'blurhash'
import { buildPersonalNote } from '@/lib/personalization'
import styles from './HeroSection.module.css'

const CHAPTER_DURATION = 4400
const subscribeToHydration = () => () => undefined
const BLURHASH_POSTER = 'LjD,4Y~q~q-;t7t7t7t7IUM{M{Rj'

const CHAPTERS = [
  {
    id: 'matter',
    label: 'Matter',
    note: 'Glass. Blotter. Raw material.',
  },
  {
    id: 'memory',
    label: 'Memory',
    note: 'What stayed after the dry-down.',
  },
  {
    id: 'identity',
    label: 'Identity',
    note: 'A pattern you can finally name.',
  },
] as const

type Chapter = (typeof CHAPTERS)[number]

function BlurhashSVG({ hash, width = 100, height = 100 }: Readonly<{ hash: string; width?: number; height?: number }>) {
  const [pixels, setPixels] = useState<string>('')

  useEffect(() => {
    try {
      const pixelArray = decode(hash, width, height)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const imageData = ctx.createImageData(width, height)
      for (let i = 0; i < pixelArray.length; i++) {
        imageData.data[i * 4] = pixelArray[i * 3]
        imageData.data[i * 4 + 1] = pixelArray[i * 3 + 1]
        imageData.data[i * 4 + 2] = pixelArray[i * 3 + 2]
        imageData.data[i * 4 + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
      setPixels(canvas.toDataURL('image/png'))
    } catch (error) {
      console.error('Failed to decode blurhash:', error)
    }
  }, [hash, width, height])

  if (!pixels) return null

  return (
    <img
      src={pixels}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(16px)',
        opacity: 0.8,
      }}
    />
  )
}

type NetworkInformationLike = {
  effectiveType?: string
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike
  mozConnection?: NetworkInformationLike
  webkitConnection?: NetworkInformationLike
}

function useConnectionType() {
  const [connectionType, setConnectionType] = useState<string | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    const browserNavigator = navigator as NavigatorWithConnection
    const connection = browserNavigator.connection || browserNavigator.mozConnection || browserNavigator.webkitConnection
    if (!connection) {
      setConnectionType('4g')
      return
    }

    setConnectionType(connection.effectiveType || '4g')
    const handleChange = () => setConnectionType(connection.effectiveType || '4g')
    connection.addEventListener('change', handleChange)
    return () => connection.removeEventListener('change', handleChange)
  }, [])

  return connectionType
}

function isSlowConnection(connectionType: string): boolean {
  return connectionType === '3g' || connectionType === '2g' || connectionType === 'slow-4g'
}

function SkeletonLoader() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(60,55,48,0.6) 25%, rgba(60,55,48,0.8) 50%, rgba(60,55,48,0.6) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s infinite',
      }}
    />
  )
}

function ChapterArtifact({ chapter, title, annotation }: Readonly<{
  chapter: Chapter
  title: string
  annotation: string
}>) {
  if (chapter.id === 'matter') {
    return (
      <div className={`${styles.artifact} ${styles.matterArtifact}`}>
        <span className={styles.artifactIndex}>FIELD / 01</span>
        <p>Vetiver root</p>
        <dl>
          <div><dt>texture</dt><dd>dry earth</dd></div>
          <div><dt>weight</dt><dd>low, steady</dd></div>
          <div><dt>trace</dt><dd>skin · cloth</dd></div>
        </dl>
      </div>
    )
  }

  if (chapter.id === 'memory') {
    return (
      <div className={`${styles.artifact} ${styles.memoryArtifact}`}>
        <span className={styles.tape} aria-hidden="true" />
        <span className={styles.artifactIndex}>TRACE / TODAY</span>
        <p>{annotation}</p>
        <span className={styles.inkRule} aria-hidden="true" />
        <small>settled on paper</small>
      </div>
    )
  }

  return (
    <div className={`${styles.artifact} ${styles.identityArtifact}`}>
      <div className={styles.noseprint} aria-hidden="true">
        <span /><span /><span />
        <i className={styles.noseprintDotOne} />
        <i className={styles.noseprintDotTwo} />
        <i className={styles.noseprintDotThree} />
      </div>
      <div>
        <span className={styles.artifactIndex}>YOUR READ / EVOLVING</span>
        <p>{title}</p>
        <small>Warm woods. Soft smoke. A dry mineral edge.</small>
      </div>
    </div>
  )
}

function usePageVisibility() {
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden)
    handleVisibilityChange()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return isPageVisible
}

function useSectionVisibility(sectionRef: RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.18 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [sectionRef])

  return isVisible
}

function useLivingAtelierSequence({
  sectionRef,
  videoRef,
  hasMounted,
  shouldReduceMotion,
  hasImageLoaded,
  disableVideo,
}: {
  sectionRef: RefObject<HTMLElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  hasMounted: boolean
  shouldReduceMotion: boolean | null
  hasImageLoaded: boolean
  disableVideo: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const isVisible = useSectionVisibility(sectionRef)
  const isPageVisible = usePageVisibility()
  const isSequenceActive = hasMounted && hasImageLoaded && !shouldReduceMotion && !disableVideo && !isPaused && isVisible && isPageVisible

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleError = () => setVideoError('Video unavailable. Viewing static mode.')
    video.addEventListener('error', handleError)

    if (!isSequenceActive) {
      video.pause()
      return () => {
        video.removeEventListener('error', handleError)
      }
    }

    const timeoutId = window.setTimeout(() => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        setVideoError('Video taking too long. Viewing static mode.')
        video.pause()
      }
    }, 7000)
    const handleLoadedData = () => window.clearTimeout(timeoutId)
    video.addEventListener('loadeddata', handleLoadedData)

    void video.play().catch((_err) => {
      setIsAutoplayBlocked(true)
    })

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [isSequenceActive, videoRef])

  useEffect(() => {
    if (!isSequenceActive) return

    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % CHAPTERS.length)
    }, CHAPTER_DURATION)

    return () => window.clearInterval(interval)
  }, [isSequenceActive])

  return { activeIndex, isPaused, setIsPaused, isAutoplayBlocked, videoError }
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

function usePersona() {
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [personaName, setPersonaName] = useState<string | null>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPersonaId(localStorage.getItem('scentral_persona'))
      setPersonaName(localStorage.getItem('scentral_persona_name'))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return { personaId, personaName }
}

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasImageLoaded, setHasImageLoaded] = useState(false)
  const hasMounted = useSyncExternalStore(subscribeToHydration, () => true, () => false)
  const connectionType = useConnectionType()
  const isSlow = connectionType === null || isSlowConnection(connectionType)

  useEffect(() => {
    const img = sectionRef.current?.querySelector('img') as HTMLImageElement | null
    if (!img) return

    if (img.complete) {
      setHasImageLoaded(true)
      return
    }

    const onLoad = () => setHasImageLoaded(true)
    img.addEventListener('load', onLoad)
    return () => img.removeEventListener('load', onLoad)
  }, [])

  const { activeIndex, isPaused, setIsPaused, isAutoplayBlocked, videoError } = useLivingAtelierSequence({
    sectionRef,
    videoRef,
    hasMounted,
    shouldReduceMotion,
    hasImageLoaded,
    disableVideo: isSlow,
  })
  const { personaId, personaName } = usePersona()
  const isMobileViewport = useIsMobileViewport()

  const note = useMemo(() => buildPersonalNote({ personaId, personaName }), [personaId, personaName])
  const isStaticPoster = hasMounted && (shouldReduceMotion || isSlow)
  const displayedIndex = isStaticPoster ? 2 : activeIndex
  const activeChapter = CHAPTERS[displayedIndex]

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <header className={styles.header}>
        <p className={styles.wordmark} aria-label="nota.">
          nota<span>.</span>
        </p>
        <span className={styles.fieldNote}>Living atelier · field note 01</span>
      </header>

      <div className={styles.copyPanel}>
        <div className={styles.copyInner}>
          <p className={styles.eyebrow}>A personal scent-identity system</p>
          <h1 id="hero-title" className={styles.title}>
            Your scent identity,{' '}
            <em>written in motion.</em>
          </h1>
          <p className={styles.intro}>
            nota. notices what you reach for, what lasts on skin, and what you remember.
            It turns those traces into language that feels like you.
          </p>
          <div className={styles.actions}>
            <Link href="/read" className={styles.primaryAction}>
              Begin your Read <span aria-hidden="true">↗</span>
            </Link>
            <p className={styles.continuationCue} aria-hidden="true">
              The atelier continues below <span>↓</span>
            </p>
          </div>
        </div>

        <div className={styles.chapterRail} aria-label="Living Atelier sequence">
          {CHAPTERS.map((chapter, index) => (
            <div
              key={chapter.id}
              className={styles.chapter}
              data-active={displayedIndex === index}
            >
              <span className={styles.chapterNumber}>0{index + 1}</span>
              <span>
                <strong>{chapter.label}</strong>
                <small>{chapter.note}</small>
              </span>
              <span className={styles.chapterTrack} aria-hidden="true">
                <span style={{ animationDuration: `${CHAPTER_DURATION}ms` }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mediaPanel}>
        {/* Source footage: black ink in water, Mixkit (Mixkit Free License, commercial use). */}
        {/* Poster rendered with WebP + JPEG fallback for LCP; video is progressive enhancement for motion-enabled users. */}
        <picture className={styles.poster}>
          {/* Blurhash placeholder — visible at 0ms */}
          {hasMounted && <BlurhashSVG hash={BLURHASH_POSTER} width={32} height={32} />}

          {/* Skeleton loader for slow connections */}
          {hasMounted && isSlow && !hasImageLoaded && <SkeletonLoader />}

          <source
            media="(max-width: 700px)"
            srcSet="/media/atelier-matter-mobile-poster-sm.webp 390w, /media/atelier-matter-mobile-poster.webp 720w"
            sizes="100vw"
            type="image/webp"
          />
          <source
            media="(max-width: 700px)"
            srcSet="/media/atelier-matter-mobile-poster.jpg"
          />
          <source
            srcSet="/media/atelier-matter-poster.webp"
            type="image/webp"
          />
          <img
            className={styles.film}
            src="/media/atelier-matter-poster.jpg"
            alt="Dark ink blooming and dispersing through clear water"
            loading="eager"
            fetchPriority="high"
            style={{
              transition: hasImageLoaded ? 'opacity 0.6s ease-out' : 'none',
              opacity: hasImageLoaded ? 1 : 0.95,
            }}
          />
        </picture>
        {!shouldReduceMotion && hasMounted && !isSlow && (
          <video
            ref={videoRef}
            className={styles.film}
            style={{ position: 'absolute', top: 0, left: 0 }}
            muted
            loop
            playsInline
            preload="none"
            poster={isMobileViewport ? '/media/atelier-matter-mobile-poster.jpg' : '/media/atelier-matter-poster.jpg'}
            aria-label="Dark ink blooms and disperses through clear water"
          >
            <source media="(max-width: 700px)" src="/media/atelier-matter-mobile.mp4" type="video/mp4" />
            <source src="/media/atelier-matter.webm" type="video/webm" />
            <source src="/media/atelier-matter.mp4" type="video/mp4" />
          </video>
        )}
        <div className={styles.filmWash} aria-hidden="true" />

        <div className={styles.chapterStage} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={isStaticPoster ? false : { opacity: 0, y: 18, rotate: -0.5 }}
              animate={{ opacity: 1, y: 0, rotate: activeChapter.id === 'memory' ? -1.5 : 0 }}
              exit={isStaticPoster ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: isStaticPoster ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChapterArtifact
                chapter={activeChapter}
                title={personaName ? note.title : 'A quiet intensity'}
                annotation={note.annotation}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.mediaCaption}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Film study / matter becoming memory</span>
            {personaName && (
              <span
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.6,
                  fontStyle: 'italic',
                  marginLeft: 'auto',
                }}
                title="This chapter is personalized based on your scent profile"
              >
                Written for you
              </span>
            )}
          </div>
          {!isStaticPoster && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {(isAutoplayBlocked || videoError) && (
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  {videoError || 'Autoplay blocked'} —
                </span>
              )}
              <button
                type="button"
                className={styles.pauseButton}
                onClick={() => setIsPaused(current => !current)}
                aria-pressed={isPaused}
                aria-label={isPaused || isAutoplayBlocked || videoError ? 'Play the Living Atelier sequence' : 'Pause the Living Atelier sequence'}
              >
                <span aria-hidden="true">{isPaused || isAutoplayBlocked || videoError ? '▶' : 'Ⅱ'}</span>
                {isPaused || isAutoplayBlocked || videoError ? 'Play' : 'Pause'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
