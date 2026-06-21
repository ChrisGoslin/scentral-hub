'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  creatorId: string
  currentUserId?: string
}

export default function CreatorProfileClient({ creatorId, currentUserId }: Props) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      // Redirect to login
      window.location.href = '/auth/login'
      return
    }

    setIsLoading(true)
    try {
      const action = isFollowing ? 'unfollow' : 'follow'
      // API call would go here for follow/unfollow
      // For v1, just toggle locally
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Follow toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      style={{
        background: isFollowing ? 'transparent' : 'var(--accent)',
        color: isFollowing ? 'var(--accent)' : 'var(--bg)',
        border: `1px solid var(--accent)`,
      }}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
