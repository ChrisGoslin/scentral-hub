'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { startBarcodeScanner, parseBarcodeFromVideo, isValidBarcode } from '@/lib/barcode'
import { lookupFragranceByBarcode } from '@/lib/barcode-db'
import Link from 'next/link'

interface ScannedFragrance {
  fragrance_id: string
  brand: string
  name: string
  image_url?: string
}

export default function ScannerPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle')
  const [cameraError, setCameraError] = useState<string>('')
  const [scannedFragrance, setScannedFragrance] = useState<ScannedFragrance | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('Point at barcode to scan')
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scannerStopRef = useRef<(() => void) | null>(null)

  /**
   * Initialize camera
   */
  async function initCamera() {
    if (!videoRef.current) return

    setCameraState('requesting')
    setCameraError('')

    try {
      const { stop } = await startBarcodeScanner(videoRef.current, {
        facingMode: 'environment',
        width: 640,
        height: 480,
      })

      scannerStopRef.current = stop
      setCameraState('active')

      // Start continuous barcode scanning
      startContinuousScanning()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to access camera'
      setCameraError(message)
      setCameraState('error')
    }
  }

  /**
   * Start continuous barcode detection loop
   */
  function startContinuousScanning() {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    let frameCount = 0
    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || cameraState !== 'active') return
      if (scannedFragrance) return // Stop if already scanned

      frameCount++
      try {
        const barcode = await parseBarcodeFromVideo(videoRef.current)

        if (barcode && isValidBarcode(barcode)) {
          const entry = lookupFragranceByBarcode(barcode)
          if (entry) {
            handleBarcodeDetected(barcode, entry)
          }
        }
      } catch (error) {
        console.warn('Barcode scan error:', error)
      }

      // Every 30 frames, show user it's still scanning
      if (frameCount % 30 === 0) {
        setScanMessage(`Scanning... (${frameCount} frames)`)
      }
    }, 100) // Check every 100ms
  }

  /**
   * Handle successful barcode detection
   */
  function handleBarcodeDetected(barcode: string, entry: any) {
    setIsScanning(false)
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    const fragrance: ScannedFragrance = {
      fragrance_id: entry.fragrance_id,
      brand: entry.brand,
      name: entry.name,
    }

    setScannedFragrance(fragrance)
    setScanMessage(`Found: ${entry.brand} ${entry.name}`)

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  /**
   * Add scanned fragrance to collection
   */
  async function addToCollection() {
    if (!scannedFragrance) return

    try {
      const response = await fetch('/api/collection/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance_id: scannedFragrance.fragrance_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to collection')
      }

      // Navigate back to collection
      router.push('/collection')
    } catch (error) {
      setScanMessage('Error adding to collection. Please try again.')
      console.error('Add to collection error:', error)
    }
  }

  /**
   * Reset and scan again
   */
  function scanAgain() {
    setScannedFragrance(null)
    setScanMessage('Point at barcode to scan')
    setIsScanning(false)

    if (cameraState === 'active') {
      startContinuousScanning()
    }
  }

  /**
   * Close scanner
   */
  function closeScanner() {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    if (scannerStopRef.current) scannerStopRef.current()
    router.back()
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (scannerStopRef.current) scannerStopRef.current()
    }
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Camera/Scanner Area */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        aspectRatio: '1/1',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
        marginBottom: '24px',
      }}>
        {cameraState === 'idle' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10,
          }}>
            <Button onClick={initCamera} variant="primary" style={{ padding: '16px 24px', fontSize: '16px' }}>
              Enable Camera
            </Button>
          </div>
        )}

        {cameraState === 'requesting' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10,
          }}>
            <div style={{ color: '#fff', fontSize: '14px', textAlign: 'center' }}>
              Requesting camera access...
            </div>
          </div>
        )}

        {cameraState === 'error' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10,
            padding: '16px',
          }}>
            <div style={{ color: '#fff', fontSize: '14px', textAlign: 'center' }}>
              <p style={{ marginBottom: '12px' }}>Camera Error</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '16px' }}>
                {cameraError}
              </p>
              <Button onClick={initCamera} variant="primary">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {cameraState === 'active' && (
          <>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              autoPlay
              playsInline
            />

            {/* Crosshair Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              <div style={{
                width: '200px',
                height: '100px',
                border: '2px solid rgba(196, 154, 60, 0.6)',
                borderRadius: '8px',
                background: 'transparent',
                position: 'relative',
              }}>
                {/* Corner accents */}
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  width: '20px',
                  height: '20px',
                  borderTop: '2px solid var(--accent)',
                  borderLeft: '2px solid var(--accent)',
                  borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  borderTop: '2px solid var(--accent)',
                  borderRight: '2px solid var(--accent)',
                  borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '-8px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '2px solid var(--accent)',
                  borderLeft: '2px solid var(--accent)',
                  borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '2px solid var(--accent)',
                  borderRight: '2px solid var(--accent)',
                  borderRadius: '2px',
                }} />
              </div>
            </div>

            {/* Status text */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              fontWeight: 500,
              zIndex: 5,
            }}>
              {scanMessage}
            </div>
          </>
        )}
      </div>

      {/* Result or Instructions */}
      {scannedFragrance ? (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          borderRadius: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text)',
          }}>
            {scannedFragrance.brand}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}>
            {scannedFragrance.name}
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={addToCollection}
              variant="primary"
              style={{ flex: 1 }}
            >
              Add to Collection
            </Button>
            <Button
              onClick={scanAgain}
              variant="secondary"
              style={{ flex: 1 }}
            >
              Scan Another
            </Button>
          </div>
        </div>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          marginBottom: '24px',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}>
          {cameraState === 'active' && (
            <>
              <p style={{ marginBottom: '8px' }}>📱 Scanner Ready</p>
              <p style={{ fontSize: '13px' }}>
                Point your camera at a fragrance barcode to add bottles to your collection.
              </p>
            </>
          )}
          {cameraState === 'idle' && (
            <p style={{ fontSize: '13px' }}>
              Enable your camera to begin scanning barcodes.
            </p>
          )}
        </div>
      )}

      {/* Close Button */}
      <Button
        onClick={closeScanner}
        variant="secondary"
        style={{ marginBottom: '16px' }}
      >
        Close Scanner
      </Button>

      {/* Help Link */}
      <Link
        href="/collection"
        style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          borderBottom: '1px solid currentColor',
        }}
      >
        Back to Collection
      </Link>
    </div>
  )
}
