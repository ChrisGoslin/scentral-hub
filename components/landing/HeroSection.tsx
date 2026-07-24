'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { buildPersonalNote } from '@/lib/personalization'
import styles from './HeroSection.module.css'

const CHAPTER_DURATION = 4400
const subscribeToHydration = () => () => undefined

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
}: {
  sectionRef: RefObject<HTMLElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  hasMounted: boolean
  shouldReduceMotion: boolean | null
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isVisible = useSectionVisibility(sectionRef)
  const isPageVisible = usePageVisibility()
  const isSequenceActive = hasMounted && !shouldReduceMotion && !isPaused && isVisible && isPageVisible

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isSequenceActive) {
      video.pause()
      return
    }

    void video.play().catch(() => {
      // The poster remains the intentional fallback when autoplay is unavailable.
    })
  }, [isSequenceActive, videoRef])

  useEffect(() => {
    if (!isSequenceActive) return

    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % CHAPTERS.length)
    }, CHAPTER_DURATION)

    return () => window.clearInterval(interval)
  }, [isSequenceActive])

  return { activeIndex, isPaused, setIsPaused }
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
  const hasMounted = useSyncExternalStore(subscribeToHydration, () => true, () => false)
  const { activeIndex, isPaused, setIsPaused } = useLivingAtelierSequence({
    sectionRef,
    videoRef,
    hasMounted,
    shouldReduceMotion,
  })
  const { personaId, personaName } = usePersona()

  const note = useMemo(() => buildPersonalNote({ personaId, personaName }), [personaId, personaName])
  const isStaticPoster = hasMounted && shouldReduceMotion
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
        {isStaticPoster ? (
          <picture>
            <source media="(max-width: 700px)" srcSet="/media/atelier-matter-mobile-poster.jpg" />
            <img
              className={styles.film}
              src="/media/atelier-matter-poster.jpg"
              alt="Dark ink blooming and dispersing through clear water"
            />
          </picture>
        ) : (
          <video
            ref={videoRef}
            className={styles.film}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/atelier-matter-poster.jpg"
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
          <span>Film study / matter becoming memory</span>
          {!isStaticPoster && (
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => setIsPaused(current => !current)}
              aria-pressed={isPaused}
              aria-label={isPaused ? 'Play the Living Atelier sequence' : 'Pause the Living Atelier sequence'}
            >
              <span aria-hidden="true">{isPaused ? '▶' : 'Ⅱ'}</span>
              {isPaused ? 'Play' : 'Pause'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
