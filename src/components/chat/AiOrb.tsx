import type { VideoHTMLAttributes } from 'react';

/**
 * AiOrb — the animated assistant orb video. One definition, reused everywhere
 * (tariff pill + open card today; hero/journey next). Plays at 3× once ready.
 * Pass the positioning/size class via `className` (the orb's CSS still lives with
 * its consumer until the chat is fully consolidated into AiChat).
 */
export type AiOrbProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'children'>;

export function AiOrb({ className, ...rest }: AiOrbProps) {
  return (
    <video
      className={className}
      src="/orb-anim.mp4"
      autoPlay
      loop
      muted
      playsInline
      onCanPlay={(e) => { e.currentTarget.playbackRate = 3; }}
      {...rest}
    />
  );
}

export default AiOrb;
