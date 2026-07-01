'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'

type Challenge = {
  id: string
  title: string
  description: string | null
  category: string | null
  participant_count: number
}

type Props = {
  challenge: Challenge
}

export default function ChallengeCard({ challenge }: Props) {
  const [isAccepted, setIsAccepted] = useState(false)
  const [participantCount, setParticipantCount] = useState(challenge.participant_count)
  const [isUpdating, setIsUpdating] = useState(false)

  // Check if challenge is already accepted on mount
  useEffect(() => {
    const activeChallenge = localStorage.getItem('scentral_active_challenge')
    if (activeChallenge === challenge.id) {
      setIsAccepted(true)
    }
  }, [challenge.id])

  const handleAcceptChallenge = async () => {
    if (isAccepted) return
    setIsUpdating(true)

    try {
      const supabase = createClient()

      // Increment participant count via RPC (atomic operation)
      const { error: rpcError } = await supabase.rpc('increment_challenge_participants', {
        challenge_id: challenge.id,
      })

      if (rpcError) {
        // Fallback: direct update if RPC doesn't exist yet
        await supabase
          .from('weekly_challenges')
          .update({ participant_count: participantCount + 1 })
          .eq('id', challenge.id)
      }

      // Store in localStorage
      localStorage.setItem('scentral_active_challenge', challenge.id)
      setIsAccepted(true)
      setParticipantCount(prev => prev + 1)
    } catch (e) {
      console.error('Error accepting challenge:', e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 6px 0',
          }}
        >
          {challenge.title}
        </h3>
        {challenge.description && (
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {challenge.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        {challenge.category && (
          <span
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {challenge.category}
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
        </span>
      </div>

      <Button
        onClick={handleAcceptChallenge}
        disabled={isAccepted || isUpdating}
        style={{
          width: '100%',
          opacity: isAccepted ? 0.6 : 1,
          cursor: isAccepted ? 'default' : 'pointer',
        }}
      >
        {isAccepted ? '✓ Challenge Accepted' : 'Accept Challenge'}
      </Button>
    </div>
  )
}
