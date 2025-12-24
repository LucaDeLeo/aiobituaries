import { ImageResponse } from 'next/og'

// Apple Touch Icon (180x180)
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        {/* Tombstone shape using div */}
        <div
          style={{
            width: 100,
            height: 120,
            border: '3px solid #c9a227',
            borderRadius: '50px 50px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#c9a227', fontSize: 24, fontWeight: 500 }}>
            R.I.P.
          </span>
          <span style={{ color: '#c9a227', fontSize: 18 }}>
            AI
          </span>
        </div>
        {/* Ground line */}
        <div
          style={{
            width: 110,
            height: 3,
            background: '#c9a227',
            marginTop: -1,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
