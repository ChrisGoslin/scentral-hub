'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { getPersonaById } from '@/lib/personas'

interface Post {
  id: string
  user_id: string
  fragrance_id: string
  caption: string | null
  wear_photo_url: string | null
  likes: number
  created_at: string
  profiles: any
  fragrances: any
}

interface Props {
  posts: Post[]
  currentUserId: string
  userLikedPostIds: Set<string>
}

export default function WearAndShareClient({
  posts,
  currentUserId,
  userLikedPostIds: initialLikedPostIds,
}: Props) {
  const [likedPostIds, setLikedPostIds] = useState(initialLikedPostIds)
  const [loadingPostIds, setLoadingPostIds] = useState<Set<string>>(new Set())

  const handleLikeToggle = async (postId: string) => {
    const isLiked = likedPostIds.has(postId)
    const action = isLiked ? 'unlike' : 'like'

    // Optimistic UI update
    setLikedPostIds((prev) => {
      const next = new Set(prev)
      if (isLiked) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })

    // API call
    setLoadingPostIds((prev) => new Set([...prev, postId]))
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUserId,
          action,
        }),
      })

      if (!res.ok && res.status !== 409) {
        // Revert optimistic update on error (ignore 409 - already liked)
        setLikedPostIds((prev) => {
          const next = new Set(prev)
          if (isLiked) {
            next.add(postId)
          } else {
            next.delete(postId)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Like toggle error:', error)
      // Revert on error
      setLikedPostIds((prev) => {
        const next = new Set(prev)
        if (isLiked) {
          next.add(postId)
        } else {
          next.delete(postId)
        }
        return next
      })
    } finally {
      setLoadingPostIds((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {posts.map((post) => {
        // Extract persona from user profile or default to empty
        const personaId = post.profiles?.[0]?.persona || null
        const personaName = personaId ? getPersonaById(personaId)?.name || '' : ''

        // Truncate caption to 2 lines
        const truncatedCaption = post.caption
          ? post.caption.split('\n').slice(0, 2).join('\n').substring(0, 150)
          : null

        return (
          <div
            key={post.id}
            style={{
              borderTop: '1px solid var(--accent)',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
          >
            {/* Persona name · Brand (9px uppercase) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              {personaName && (
                <>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text)',
                    }}
                  >
                    {personaName}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>·</span>
                </>
              )}
              {post.fragrances?.[0]?.brand && (
                <span
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {post.fragrances[0].brand}
                </span>
              )}
            </div>

            {/* Fragrance name (Cormorant Garamond italic, 16px) */}
            {post.fragrances?.[0] && (
              <Link href={`/collection/${post.fragrance_id}`}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    color: 'var(--text)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  {post.fragrances[0].name}
                </h3>
              </Link>
            )}

            {/* User's note in quotes (13px italic muted, max 2 lines) */}
            {truncatedCaption && (
              <p
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                "{truncatedCaption}"
              </p>
            )}

            {/* Bottom actions: heart, comment, share (12px muted) */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <button
                onClick={() => handleLikeToggle(post.id)}
                disabled={loadingPostIds.has(post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: likedPostIds.has(post.id) ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: loadingPostIds.has(post.id) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: loadingPostIds.has(post.id) ? 0.5 : 1,
                  transition: 'color 0.2s',
                  padding: 0,
                }}
              >
                <span>{likedPostIds.has(post.id) ? '❤' : '🤍'}</span>
                {post.likes}
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                }}
              >
                <span>💬</span>
                0
              </button>

              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                }}
              >
                <span>↗</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
