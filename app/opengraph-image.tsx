import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The Yellow Express - Envios Los Angeles a El Salvador'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Yellow accent glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#FFD700',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            📦
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFD700',
            }}
          >
            The Yellow Express
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          Envios Seguros Los Angeles → El Salvador
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '24px',
          }}
        >
          {['5-7 Dias', 'Rastreo Real', 'Desde $6.99/lb', '14 Departamentos'].map((feat) => (
            <div
              key={feat}
              style={{
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: '8px',
                padding: '12px 20px',
                color: '#FFD700',
                fontSize: '18px',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {feat}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
