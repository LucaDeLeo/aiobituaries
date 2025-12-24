import { ImageResponse } from 'next/og'

// Standard favicon (32x32)
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Simplified tombstone for small size */}
        <div
          style={{
            width: 20,
            height: 22,
            border: '2px solid #c9a227',
            borderRadius: '10px 10px 0 0',
          }}
        />
        {/* Ground line */}
        <div
          style={{
            width: 24,
            height: 2,
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
