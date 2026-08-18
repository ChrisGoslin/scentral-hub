'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // For browsers that don't support native CSS scroll timelines, 
  // we can use a hybrid framer-motion approach for the landing page hero since it's the 
  // cinematic "BBC Storyworks" introduction, giving buttery parallax out of the box.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Cinematic Parallax Transforms
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacityTitle = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const yBottles = useTransform(scrollYProgress, [0, 1], [0, -150])
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <main className={styles.mainWrapper} ref={containerRef}>
      
      {/* 
        SECTION 1: THE HOOK 
        Massive serif typography, full screen, sinking slowly on scroll
      */}
      <section className={styles.heroSection}>
        <motion.div 
          className={styles.heroContent}
          style={{ y: yTitle, opacity: opacityTitle }}
        >
          <p className={styles.kicker}>The Living Atelier</p>
          <h1 className={styles.massiveTitle}>
            nota<span className={styles.period}>.</span>
          </h1>
          <p className={styles.subtitle}>
            Your scent identity, written in motion.
          </p>
        </motion.div>
        
        {/* Parallax Background Texture */}
        <motion.div 
          className={styles.heroTexture} 
          style={{ y: yBg }}
        />
      </section>

      {/* 
        SECTION 2: THE IMMERSIVE REVEAL
        Floating items crossing the threshold
      */}
      <section className={styles.manifestoSection}>
        <div className={styles.manifestoContent}>
          <h2>The system notices before it asks.</h2>
          <p>
            Your taste is already in motion. We read the evidence you leave behind,
            connecting memory, skin, and air without flattening you into a percentage.
          </p>
        </div>

        {/* Floating Abstract Shapes / Bottles */}
        <motion.div className={styles.floatingBottleContainer} style={{ y: yBottles }}>
          <div className={styles.abstractBottle1} />
          <div className={styles.abstractBottle2} />
          <div className={styles.abstractBottle3} />
        </motion.div>
      </section>

      {/* 
        SECTION 3: ENTER THE SANCTUARY
      */}
      <section className={styles.entrySection}>
        <div className={styles.entryBox}>
          <h3>The Sanctuary Awaits</h3>
          <p>Begin with what you already know. Step into the Master Shelf.</p>
          
          <div className={styles.actionRow}>
            <Link href="/shelf" className={styles.primaryLink}>
              Enter Master Shelf
            </Link>
            <Link href="/labs" className={styles.secondaryLink}>
              Experience nota.Labs
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  )
}
