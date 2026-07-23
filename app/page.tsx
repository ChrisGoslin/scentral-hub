import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/landing/HeroSection'
import styles from './page.module.css'

const TITLE = 'nota. — Your Scent Identity, Written in Motion'
const DESCRIPTION =
  'A personal scent-identity system that turns what you wear, remember, and reach for into language that feels like you.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/api/og'],
  },
}

const OBSERVATIONS = [
  {
    label: 'Matter',
    title: 'What touches skin',
    copy: 'Notes, texture, projection, weather. The physical evidence comes first.',
  },
  {
    label: 'Memory',
    title: 'What stays with you',
    copy: 'A place. A person. The hour a dry-down changed. Traces keep the human part intact.',
  },
  {
    label: 'Identity',
    title: 'What the pattern reveals',
    copy: 'nota. reflects your choices back in plain language. Never a score. Never a verdict.',
  },
]

export default function Home() {
  return (
    <div className={styles.page}>
      <HeroSection />

      <section id="atelier-method" className={styles.method} aria-labelledby="method-title">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>The atelier method</p>
          <h2 id="method-title">The system notices before it asks.</h2>
          <p>
            Your taste is already in motion. nota. reads the evidence you leave behind and
            gives it back without flattening it into a percentage.
          </p>
        </div>

        <ol className={styles.observationList}>
          {OBSERVATIONS.map((observation, index) => (
            <li key={observation.label}>
              <span className={styles.observationNumber}>0{index + 1}</span>
              <div>
                <p>{observation.label}</p>
                <h3>{observation.title}</h3>
                <span>{observation.copy}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.readSection} aria-labelledby="read-title">
        <div className={styles.readCopy}>
          <p className={styles.kicker}>The Read</p>
          <h2 id="read-title">Recognition, not categorisation.</h2>
          <p>
            Begin with what you already know: the bottle you keep returning to, the one that
            disappears too quickly, the memory that never does. nota. finds the thread.
          </p>
          <Link href="/read" className={styles.inkLink}>
            Begin your Read <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className={styles.dossier} aria-label="Example Read observation">
          <span className={styles.tape} aria-hidden="true" />
          <p className={styles.dossierLabel}>Observation / not a verdict</p>
          <blockquote>
            You tend to choose warmth without sweetness. Woods stay. Smoke appears when the
            day slows down.
          </blockquote>
          <div className={styles.dossierNotes}>
            <span>wear / skin</span>
            <span>memory / evening</span>
            <span>shift / dry mineral</span>
          </div>
          <p className={styles.dossierClose}>Still fits.</p>
        </div>
      </section>

      <section className={styles.lineageSection} aria-labelledby="lineage-title">
        <div className={styles.lineageHeading}>
          <p className={styles.kicker}>Radical honesty</p>
          <h2 id="lineage-title">A recommendation should show its working.</h2>
        </div>

        <div className={styles.lineageWorkbench}>
          <article className={styles.referenceCard}>
            <p>Familiar reference</p>
            <h3>Airy saffron over warm woods</h3>
            <span>The shape you already recognise.</span>
          </article>
          <div className={styles.lineageThread} aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <article className={styles.alternativeCard}>
            <p>Open alternative</p>
            <h3>Same luminous heart, softer mineral base</h3>
            <span>Shared heart notes · lighter projection · lower blind-buy risk</span>
          </article>
        </div>

        <p className={styles.lineageNote}>
          You decide what prestige means. nota. only makes the trade-off visible.
        </p>
      </section>

      <section className={styles.traceSection} aria-labelledby="trace-title">
        <div className={styles.tracePaper}>
          <span className={styles.traceDate}>A trace / after rain</span>
          <p>
            It opened like cold stone, then warmed into something familiar. I wore it for the
            walk home and kept catching it on my sleeve.
          </p>
          <span className={styles.traceSignature}>Trace left.</span>
        </div>
        <div className={styles.traceCopy}>
          <p className={styles.kicker}>Asynchronous resonance</p>
          <h2 id="trace-title">No scorekeeping. Just recognition.</h2>
          <p>
            Traces are field notes from people who smell differently. When one feels true, you
            leave Resonance. The paper gathers patina; nobody climbs a leaderboard.
          </p>
          <Link href="/traces" className={styles.inkLinkDark}>
            Read the Traces <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <p className={styles.kicker}>Your nose is your absolute truth</p>
        <h2 id="closing-title">
          Start with one scent.
          <em>See what it remembers.</em>
        </h2>
        <Link href="/read" className={styles.closingAction}>
          Begin your Read <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerWordmark}>nota<span>.</span></p>
        <p>A personal scent-identity system.</p>
        <nav aria-label="Legal and community links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/traces">Traces</Link>
        </nav>
      </footer>
    </div>
  )
}
