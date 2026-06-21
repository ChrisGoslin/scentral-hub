'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'

interface Reel {
  id: string
  title: string
  description: string | null
  video_url: string | null
  thumbnail_url: string | null
  views: number
  created_at: string
}

interface Props {
  reels: Reel[]
  creatorId: string
}

export default function CreatorDashboardClient({ reels, creatorId }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadError(null)

    // Validate form
    if (!formData.title.trim()) {
      setUploadError('Title is required')
      setIsUploading(false)
      return
    }

    try {
      // For v1, mock the upload - in production, upload to Supabase Storage
      // then insert reel record
      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          video_url: `https://storage.example.com/reels/${Date.now()}.mp4`,
          thumbnail_url: `https://storage.example.com/thumbnails/${Date.now()}.jpg`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create reel')
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        videoFile: null,
        thumbnailFile: null,
      })

      // Trigger refresh (in production, use SWR/React Query)
      window.location.reload()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Upload Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
          Upload New Reel
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500' }}>
              Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Layering Guide"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--line)',
                borderRadius: '0.5rem',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.95rem',
              }}
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              placeholder="Describe your reel..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--line)',
                borderRadius: '0.5rem',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                minHeight: '100px',
                fontFamily: 'inherit',
              }}
              disabled={isUploading}
            />
          </div>

          {/* Video Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500' }}>
              Video File (v1: mock only)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFormData({ ...formData, videoFile: e.target.files?.[0] || null })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--line)',
                borderRadius: '0.5rem',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
              disabled={isUploading}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {formData.videoFile ? `Selected: ${formData.videoFile.name}` : 'Select a video to upload'}
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500' }}>
              Thumbnail (v1: mock only)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files?.[0] || null })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--line)',
                borderRadius: '0.5rem',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
              disabled={isUploading}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {formData.thumbnailFile ? `Selected: ${formData.thumbnailFile.name}` : 'Select an image for the thumbnail'}
            </p>
          </div>

          {/* Error */}
          {uploadError && (
            <div style={{ padding: '0.75rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {uploadError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isUploading}
            style={{ width: '100%' }}
          >
            {isUploading ? 'Uploading...' : 'Upload Reel'}
          </Button>
        </form>
      </div>

      {/* Reels List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
          Your Reels
        </h2>

        {reels.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No reels yet. Upload your first reel to get started!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {reels.map((reel) => (
              <div
                key={reel.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                }}
              >
                {/* Thumbnail */}
                {reel.thumbnail_url && (
                  <div style={{ width: '100%', aspectRatio: '9 / 16', overflow: 'hidden' }}>
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                {/* Info */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    {reel.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {new Date(reel.created_at).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>{reel.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
