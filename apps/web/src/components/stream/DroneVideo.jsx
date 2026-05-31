import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function DroneVideo({ streamUrl, inactive = false, className = '', style = {} }) {
  const videoRef = useRef(null)
  const hlsRef   = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || inactive || !streamUrl) return

    function attach() {
      if (Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10 })
        hlsRef.current = hls
        hls.loadSource(streamUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}) })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = streamUrl
        video.play().catch(() => {})
      }
    }

    attach()
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [streamUrl, inactive])

  if (inactive) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1018', ...style }}>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'rgba(74,85,104,0.5)', letterSpacing: 2 }}>
          STANDBY
        </span>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', background: '#0d1018', ...style }}
      muted
      playsInline
      autoPlay
    />
  )
}
