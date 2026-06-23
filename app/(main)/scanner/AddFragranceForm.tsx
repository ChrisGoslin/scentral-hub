'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface AddFragranceFormProps {
  onSubmit: (data: { brand: string; name: string; family: string; notes?: string }) => Promise<void>
  loading?: boolean
}

const FAMILIES = [
  'Citrus',
  'Floral',
  'Fruity',
  'Woody',
  'Aromatic',
  'Oriental',
  'Chypre',
  'Herbal',
  'Spicy',
  'Amber',
  'Aquatic',
  'Gourmand',
]

export default function AddFragranceForm({ onSubmit, loading = false }: AddFragranceFormProps) {
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [family, setFamily] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!brand.trim() || !name.trim() || !family) {
      setError('Brand, name, and family are required')
      return
    }

    try {
      await onSubmit({ brand: brand.trim(), name: name.trim(), family, notes: notes.trim() || undefined })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fragrance')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
          Brand *
        </label>
        <input
          type="text"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          disabled={loading}
          placeholder="e.g., Dior, Creed"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
          Fragrance Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          placeholder="e.g., Sauvage, Aventus"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
          Family *
        </label>
        <select
          value={family}
          onChange={e => setFamily(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        >
          <option value="">Select a family</option>
          {FAMILIES.map(f => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={loading}
          placeholder="e.g., Top notes: bergamot, heart: lavender, base: ambroxan"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            fontFamily: 'inherit',
            minHeight: '80px',
            resize: 'vertical',
          }}
        />
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Adding...' : 'Add Fragrance & Earn 50 XP'}
      </Button>
    </form>
  )
}
