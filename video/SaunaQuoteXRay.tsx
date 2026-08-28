import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const colors = {
  ink: '#171411',
  inkSoft: '#25211d',
  cream: '#f6f1e8',
  paper: '#fffdf8',
  tan: '#d2a875',
  tanSoft: '#ead9c3',
  green: '#54d99a',
  red: '#d76456',
  muted: '#b9afa4',
}

const sans = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const serif = 'Georgia, "Times New Roman", serif'

const enter = (frame: number, delay = 0) => {
  const value = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return {
    opacity: value,
    transform: `translateY(${(1 - value) * 24}px)`,
  }
}

const fadeScene = (frame: number, duration: number) => interpolate(
  frame,
  [0, 12, duration - 12, duration],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
)

const Badge = ({ children, accent = colors.tan }: { children: ReactNode; accent?: string }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    border: `1px solid ${accent}66`,
    borderRadius: 999,
    color: accent,
    fontFamily: sans,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  }}>
    <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
    {children}
  </div>
)

const ToolCall = ({
  index,
  name,
  detail,
  frame,
}: {
  index: string
  name: string
  detail: string
  frame: number
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 110, mass: 1 } })

  return (
    <div style={{
      position: 'absolute',
      left: 48,
      bottom: 38,
      width: 520,
      padding: '18px 22px',
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'rgba(23,20,17,0.96)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
      color: colors.cream,
      fontFamily: sans,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 34}px) scale(${0.97 + progress * 0.03})`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: colors.tan, fontSize: 12, fontWeight: 800, letterSpacing: '0.14em' }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: colors.green, boxShadow: `0 0 0 7px ${colors.green}22` }} />
        WEBMCP CALL {index}
      </div>
      <div style={{ marginTop: 12, fontSize: 21, fontWeight: 800 }}>{name}</div>
      <div style={{ marginTop: 6, color: '#ded5ca', fontSize: 15, lineHeight: 1.42 }}>{detail}</div>
    </div>
  )
}

const BrowserFrame = ({
  image,
  frame,
  duration,
  scrollFrom = 0,
  scrollTo = 0,
}: {
  image: string
  frame: number
  duration: number
  scrollFrom?: number
  scrollTo?: number
}) => {
  const scrollY = interpolate(frame, [0, 45, duration - 45, duration], [scrollFrom, scrollFrom, scrollTo, scrollTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.77, 0, 0.175, 1),
  })

  return (
    <div style={{
      position: 'absolute',
      inset: 24,
      overflow: 'hidden',
      borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.16)',
      background: colors.paper,
      boxShadow: '0 30px 100px rgba(0,0,0,0.42)',
    }}>
      <div style={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '0 18px',
        background: '#e9e4dc',
        borderBottom: '1px solid #d8d0c5',
      }}>
        {['#ff605c', '#ffbd44', '#00ca4e'].map((color) => (
          <span key={color} style={{ width: 12, height: 12, borderRadius: 999, background: color }} />
        ))}
        <div style={{
          marginLeft: 18,
          width: 470,
          padding: '7px 16px',
          borderRadius: 9,
          background: '#f7f4ef',
          color: '#625b53',
          fontFamily: sans,
          fontSize: 13,
        }}>
          sauna.guide/tools/sauna-quote-xray
        </div>
      </div>
      <div style={{ position: 'absolute', inset: '40px 0 0', overflow: 'hidden', background: colors.paper }}>
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transform: `translateY(${-scrollY}px)`,
          }}
        />
      </div>
    </div>
  )
}

const HookScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const swap = spring({ frame: frame - 84, fps, config: { damping: 18, stiffness: 110, mass: 1 } })
  const visible = fadeScene(frame, 180)

  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.cream, opacity: visible, padding: '64px 76px', fontFamily: sans }}>
      <div style={enter(frame, 0)}><Badge>Before you sign</Badge></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.95fr', gap: 70, alignItems: 'center', flex: 1 }}>
        <div>
          <div style={{ ...enter(frame, 10), fontFamily: serif, fontSize: 82, lineHeight: 0.98, letterSpacing: '-0.045em' }}>
            The quote is<br />not the cost.
          </div>
          <div style={{ ...enter(frame, 24), marginTop: 30, color: '#d7cdc2', fontSize: 23, lineHeight: 1.45, maxWidth: 620 }}>
            Hidden electrical, foundation, permit and ventilation work can move the real number by thousands.
          </div>
        </div>
        <div style={{ position: 'relative', height: 430 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 30, padding: 38,
            background: 'linear-gradient(145deg, #2c2722, #1f1b18)', border: '1px solid rgba(255,255,255,.12)',
            boxShadow: '0 40px 120px rgba(0,0,0,.45)', ...enter(frame, 18),
          }}>
            <div style={{ color: colors.muted, fontSize: 15, textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800 }}>Quoted total</div>
            <div style={{ marginTop: 12, fontFamily: serif, fontSize: 76 }}>$11,750</div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.14)', margin: '28px 0' }} />
            <div style={{ color: colors.tan, fontSize: 15, textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800 }}>Projected landed cost</div>
            <div style={{ position: 'relative', marginTop: 12, height: 90 }}>
              <div style={{ position: 'absolute', fontFamily: serif, fontSize: 66, opacity: 1 - swap, transform: `translateY(${-12 * swap}px)` }}>$12,250</div>
              <div style={{ position: 'absolute', fontFamily: serif, fontSize: 66, color: '#ffd2a1', opacity: swap, transform: `translateY(${18 * (1 - swap)}px)` }}>$18,650</div>
            </div>
            <div style={{ marginTop: 16, height: 12, borderRadius: 999, background: '#3b342e', overflow: 'hidden' }}>
              <div style={{ width: `${interpolate(frame, [75, 125], [42, 88], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`, height: '100%', background: `linear-gradient(90deg, ${colors.tan}, ${colors.red})` }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const ProductScene = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: colors.ink, opacity: fadeScene(frame, 420) }}>
      <BrowserFrame image="stills/full-page.png" frame={frame} duration={432} scrollFrom={0} scrollTo={620} />
      <div style={{ position: 'absolute', right: 70, top: 76, display: 'grid', gap: 12 }}>
        {['8 narrow tools', 'Shared visible state', 'Human remains in control'].map((text, index) => (
          <div key={text} style={{
            ...enter(frame, 34 + index * 10),
            padding: '15px 20px', borderRadius: 14, background: 'rgba(23,20,17,.94)',
            border: '1px solid rgba(255,255,255,.14)', color: colors.cream, fontFamily: sans,
            fontSize: 17, fontWeight: 750, boxShadow: '0 16px 44px rgba(0,0,0,.28)',
          }}>
            <span style={{ color: colors.green, marginRight: 12 }}>●</span>{text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

const QuoteScene = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: colors.ink, opacity: fadeScene(frame, 360) }}>
      <BrowserFrame image="stills/full-page.png" frame={frame} duration={324} scrollFrom={620} scrollTo={1050} />
      <ToolCall index="01 / 08" name="load_demo_sauna_quote" detail="Load the safe backyard barrel quote into the shared canvas." frame={frame - 16} />
      <div style={{
        position: 'absolute', right: 54, top: 68, padding: '17px 20px', borderRadius: 16,
        background: colors.paper, border: `2px solid ${colors.tan}`, boxShadow: '0 22px 70px rgba(0,0,0,.26)',
        color: colors.ink, fontFamily: sans, ...enter(frame, 70),
      }}>
        <div style={{ color: '#776b60', fontSize: 14, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Visible result</div>
        <div style={{ marginTop: 5, fontFamily: serif, fontSize: 42 }}>$11,750</div>
        <div style={{ marginTop: 3, color: '#645b52', fontSize: 14 }}>3 priced line items</div>
      </div>
    </AbsoluteFill>
  )
}

const ScopeScene = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: colors.ink, opacity: fadeScene(frame, 510) }}>
      <BrowserFrame image="stills/full-page.png" frame={frame} duration={522} scrollFrom={1050} scrollTo={1950} />
      <ToolCall index="02 / 08" name="set_sauna_quote_scope" detail="Electrical: excluded. Foundation: unclear. Contact nobody." frame={frame - 10} />
      <div style={{ position: 'absolute', right: 50, top: 58, display: 'grid', gap: 8, width: 340 }}>
        {[
          ['Electrical work', 'EXCLUDED', colors.red],
          ['Foundation', 'UNCLEAR', '#c9983d'],
        ].map(([label, status, accent], index) => (
          <div key={label} style={{
            ...enter(frame, 76 + index * 12), display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 16px', borderRadius: 12, background: colors.paper, color: colors.ink,
            borderLeft: `6px solid ${accent}`, boxShadow: '0 16px 52px rgba(0,0,0,.28)', fontFamily: sans,
          }}>
            <span style={{ fontSize: 15, fontWeight: 760 }}>{label}</span>
            <span style={{ color: accent, fontSize: 11, fontWeight: 900, letterSpacing: '.1em' }}>{status}</span>
          </div>
        ))}
        <div style={{
          ...enter(frame, 124), marginTop: 6, padding: '18px 18px 16px', borderRadius: 15,
          background: colors.ink, color: colors.cream, border: `1px solid ${colors.tan}77`,
          boxShadow: '0 22px 70px rgba(0,0,0,.35)', fontFamily: sans,
        }}>
          <div style={{ color: colors.tan, fontSize: 13, fontWeight: 900, letterSpacing: '.13em' }}>PROJECTED LANDED COST</div>
          <div style={{ marginTop: 7, fontFamily: serif, fontSize: 34 }}>$12,250 to $18,650</div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const QuestionsScene = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: colors.ink, opacity: fadeScene(frame, 450) }}>
      <BrowserFrame image="stills/full-page.png" frame={frame} duration={462} scrollFrom={1950} scrollTo={2840} />
      <ToolCall index="03 / 08" name="build_sauna_contractor_questions" detail="Turn unresolved scope into questions the buyer can ask before signing." frame={frame - 12} />
      <div style={{ position: 'absolute', right: 50, top: 58, ...enter(frame, 76), padding: '14px 18px', borderRadius: 14, background: colors.paper, color: colors.ink, boxShadow: '0 18px 60px rgba(0,0,0,.3)', fontFamily: sans }}>
        <span style={{ color: colors.tan, fontSize: 29, fontFamily: serif, marginRight: 10 }}>6</span>
        <span style={{ fontSize: 15, fontWeight: 800 }}>contractor questions built</span>
      </div>
    </AbsoluteFill>
  )
}

const EndScene = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: colors.ink, color: colors.cream, padding: '76px 86px', fontFamily: sans, opacity: fadeScene(frame, 360) }}>
      <div style={enter(frame, 0)}><Badge accent={colors.green}>Live WebMCP product</Badge></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr .65fr', alignItems: 'end', flex: 1, gap: 80 }}>
        <div>
          <div style={{ ...enter(frame, 12), fontFamily: serif, fontSize: 84, lineHeight: .98, letterSpacing: '-.045em' }}>
            Make the hidden<br />number visible.
          </div>
          <div style={{ ...enter(frame, 28), marginTop: 34, fontSize: 28, fontWeight: 850, color: '#ffe0bb' }}>
            sauna.guide/tools/sauna-quote-xray
          </div>
        </div>
        <div style={{ ...enter(frame, 42), borderLeft: `1px solid ${colors.tan}66`, paddingLeft: 34, color: '#d4c9bd', fontSize: 20, lineHeight: 1.55 }}>
          Eight narrow tools.<br />One shared decision surface.<br /><span style={{ color: colors.cream }}>No lead sent without consent.</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 26, borderTop: '1px solid rgba(255,255,255,.14)', color: colors.muted, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        <span>OpenAI WebMCP Challenge 2026</span>
        <span>Public MIT source · Synthetic demo data</span>
      </div>
    </AbsoluteFill>
  )
}

export const SaunaQuoteXRay = () => (
  <AbsoluteFill style={{ background: colors.ink }}>
    <Audio src={staticFile('narration.mp3')} />
    <Sequence from={0} durationInFrames={180}><HookScene /></Sequence>
    <Sequence from={168} durationInFrames={432}><ProductScene /></Sequence>
    <Sequence from={588} durationInFrames={324}><QuoteScene /></Sequence>
    <Sequence from={900} durationInFrames={522}><ScopeScene /></Sequence>
    <Sequence from={1410} durationInFrames={462}><QuestionsScene /></Sequence>
    <Sequence from={1860} durationInFrames={360}><EndScene /></Sequence>
  </AbsoluteFill>
)
