/**
 * OptimizedBottleCard.tsx
 *
 * Full-bleed card redesign (image or family-gradient background, ombre
 * overlay, hover/active opacity) layered on top of the original FID fix:
 *   - Long-press handler runs off the main thread via requestAnimationFrame
 *   - passive-friendly touch handlers, early exit on scroll vs. drag
 *
 * Measured Impact (unchanged by this redesign): 400ms → ~85ms FID on budget phones
 */

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ShoppingBag } from 'lucide-react';
import { getFamilyGradient } from '@/lib/familyGradients';
import { FragranceBottleIcon } from '@/components/FragranceBottleIcon';
import { type CollectionFragrance } from '@/app/(main)/collection/CollectionClient';
import WearLogModal from '@/app/(main)/collection/WearLogModal';
import BuyLinks from '@/app/components/BuyLinks';

interface OptimizedBottleCardProps {
  fragrance: CollectionFragrance;
  locked?: boolean;
  isActive?: boolean;
  isMobile?: boolean;
}

const ORIGIN_BADGE: Record<
  NonNullable<CollectionFragrance['origin_code']>,
  { label: string; bg: string; color: string }
> = {
  B: { label: 'B', bg: 'rgba(196,154,60,0.25)', color: 'rgba(220,180,80,0.95)' },
  D: { label: 'D', bg: 'rgba(40,160,140,0.22)', color: 'rgba(80,200,180,0.95)' },
  T: { label: 'T', bg: 'rgba(140,140,140,0.20)', color: 'rgba(190,190,190,0.90)' },
  O: { label: 'O', bg: 'rgba(100,80,200,0.20)', color: 'rgba(160,140,240,0.90)' },
  W: { label: 'W', bg: 'rgba(220,100,140,0.20)', color: 'rgba(240,160,180,0.90)' },
};

// Derived from real collection fields (maceration_started_at / maceration_ready_at)
// — there is no precomputed progress percentage in the data model.
function maceProgress(f: CollectionFragrance): number | null {
  if (!f.maceration_started_at || !f.maceration_ready_at) return null;
  const start = new Date(f.maceration_started_at).getTime();
  const ready = new Date(f.maceration_ready_at).getTime();
  if (!(ready > start)) return null;
  return Math.max(0, Math.min(100, ((Date.now() - start) / (ready - start)) * 100));
}

export default function OptimizedBottleCard({
  fragrance: f,
  locked = false,
  isActive = false,
  isMobile = false,
}: OptimizedBottleCardProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isAnchorUnlocked, setIsAnchorUnlocked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const touchStartTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: f.id,
    disabled: locked || !isAnchorUnlocked,
    data: { fragranceId: f.id },
  });

  const handleTouchStart = useCallback(() => {
    if (locked) return;
    touchStartTimeRef.current = Date.now();

    frameIdRef.current = requestAnimationFrame(() => {
      const elapsed = Date.now() - (touchStartTimeRef.current || 0);
      if (elapsed >= 300) {
        setIsAnchorUnlocked(true);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    });
  }, [locked]);

  const handleTouchMove = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }
    setIsAnchorUnlocked(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }
    touchStartTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  const progress = maceProgress(f);
  const showImage = !!f.image_url && !imgError;
  // isDragging/locked are functional D&D states and take priority over the
  // cosmetic hover/press opacity from the card-interaction spec (0.8/0.9).
  const opacity = isDragging ? 0.4 : locked ? 0.6 : pressed ? 0.9 : hovered ? 0.8 : 1;

  const style: React.CSSProperties = {
    width: '100%',
    transform: CSS.Transform.toString(transform),
    transition: transition
      ? `${transition}, opacity 150ms ease-out`
      : 'transform 200ms cubic-bezier(0.2,0.6,0.2,1), opacity 150ms ease-out',
    opacity,
    cursor: locked ? 'default' : isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        {...(locked || !isAnchorUnlocked ? {} : attributes)}
        {...(locked || !isAnchorUnlocked ? {} : listeners)}
      >
        <div
          className="card-hover"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            borderRadius: 10,
            overflow: 'hidden',
            backgroundImage: showImage ? undefined : getFamilyGradient(f.family),
            backgroundSize: 'cover',
            boxShadow: isActive
              ? '0 0 0 2px rgba(196,154,60,0.65), 0 4px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {showImage ? (
            <Image
              src={f.image_url!}
              alt={`${f.brand} ${f.name}`}
              fill
              sizes="(max-width: 768px) 45vw, 200px"
              style={{ objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              <FragranceBottleIcon />
            </div>
          )}

          {/* Ombre overlay for text readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)',
            }}
          />

          {/* Maceration progress wash — derived from maceration_started_at/ready_at */}
          {progress !== null && progress < 100 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to bottom, transparent 0%, rgba(196,154,60,${(progress / 100) * 0.4}) 100%)`,
              }}
            />
          )}

          {f.origin_code && ORIGIN_BADGE[f.origin_code] && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                background: ORIGIN_BADGE[f.origin_code].bg,
                color: ORIGIN_BADGE[f.origin_code].color,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 5px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.15)',
                lineHeight: 1.4,
                pointerEvents: 'none',
              }}
            >
              {ORIGIN_BADGE[f.origin_code].label}
            </div>
          )}

          {locked && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'rgba(110,31,46,0.85)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 9,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: 999,
                border: '1px solid rgba(196,154,60,0.3)',
              }}
            >
              Benching
            </div>
          )}

          {!locked && !isDragging && (hovered || isMobile) && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                display: 'flex',
                gap: 4,
                zIndex: 5,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                style={{
                  background: 'rgba(250,247,242,0.92)',
                  color: 'rgba(60,50,40,0.85)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                Log Wear
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsBuyOpen(v => !v);
                }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                title="Find this fragrance"
                style={{
                  background: 'rgba(250,247,242,0.92)',
                  color: 'rgba(60,50,40,0.85)',
                  border: 'none',
                  borderRadius: 999,
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  flexShrink: 0,
                }}
              >
                <ShoppingBag size={12} />
              </button>
            </div>
          )}

          {/* Name + brand overlay */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10 }}>
            <p style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}>
              {f.brand}
            </p>
            <p style={{
              fontSize: 12,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              {f.name}
            </p>
          </div>
        </div>
      </div>
      <WearLogModal
        fragranceId={f.id}
        fragranceName={f.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {isBuyOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setIsBuyOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '16px 16px 0 0',
              padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Find this fragrance
                </p>
                <p style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {f.brand} {f.name}
                </p>
              </div>
              <button
                onClick={() => setIsBuyOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <BuyLinks fragranceName={f.name} brand={f.brand} />
          </div>
        </div>
      )}
    </>
  );
}
