import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 68, color: '#fafaf8', background: '#1c1917', fontFamily: 'Georgia' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: 'Arial', fontSize: 24, color: '#d4a574' }}>
        <div style={{ width: 44, height: 44, border: '2px solid #d4a574', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</div>
        WEBMCP CHALLENGE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 84, lineHeight: 0.95, maxWidth: 980 }}>Make the hidden number visible.</div>
        <div style={{ marginTop: 28, fontFamily: 'Arial', fontSize: 30, color: '#c5c2bc' }}>One live sauna quote canvas. Human judgment plus agent speed.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: 22, color: '#8b8884' }}>
        <span>Sauna Quote X-Ray</span><span>Nothing uploaded. Nothing sent.</span>
      </div>
    </div>,
    size,
  )
}
