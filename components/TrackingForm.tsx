'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/track/${trackingNumber.trim()}`)
    }
  }

  return (
    <form onSubmit={handleTrack} className="max-w-xl mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ingresa tu número de guía (ej: YE20240115ABC)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="h-12 text-lg"
        />
        <Button type="submit" size="lg" className="h-12 px-8">
          <MapPin className="w-5 h-5 mr-2" />
          Rastrear
        </Button>
      </div>
    </form>
  )
}
