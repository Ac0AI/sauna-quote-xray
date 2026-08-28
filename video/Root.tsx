import { Composition } from 'remotion'
import { SaunaQuoteXRay } from './SaunaQuoteXRay'

export const RemotionRoot = () => (
  <Composition
    id="SaunaQuoteXRay"
    component={SaunaQuoteXRay}
    durationInFrames={2220}
    fps={30}
    width={1440}
    height={810}
  />
)
