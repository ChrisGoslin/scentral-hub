'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {post.profiles?.[0]?.avatar_url ? (
                <img
                  src={post.profiles[0].avatar_url}
                  alt={post.profiles.display_name || 'User'}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'var(--surface-2)',
                  }}
                />
              )}
              <div>
                <p style={{ fontWeight: '600', color: 'var(--text)' }}>
                  {post.profiles?.[0]?.display_name || 'Anonymous'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Photo */}
          {post.wear_photo_url && (
            <div
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
              }}
            >
              <img
                src={post.wear_photo_url}
                alt="Wear post"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--line)' }}>
            {/* Fragrance reference */}
            {post.fragrances?.[0] && (
              <Link href={`/collection/${post.fragrance_id}`}>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  {post.fragrances[0].image_url && (
                    <img
                      src={post.fragrances[0].image_url}
                      alt={`${post.fragrances[0].brand} ${post.fragrances[0].name}`}
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.5rem',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {post.fragrances[0].brand}
                    </p>
                    <p style={{ fontWeight: '600', color: 'var(--text)' }}>
                      {post.fragrances[0].name}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Caption */}
            {post.caption && (
              <p style={{ color: 'var(--text)', marginBottom: '1rem', lineHeight: '1.6' }}>
                {post.caption}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '0.75rem 1rem' }}>
            <button
              onClick={() => handleLikeToggle(post.id)}
              disabled={loadingPostIds.has(post.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: likedPostIds.has(post.id) ? 'var(--accent)' : 'var(--text-muted)',
                cursor: loadingPostIds.has(post.id) ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                opacity: loadingPostIds.has(post.id) ? 0.5 : 1,
                transition: 'color 0.2s',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {likedPostIds.has(post.id) ? '♥' : '♡'}
              </span>
              {post.likes} {post.likes === 1 ? 'like' : 'likes'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
