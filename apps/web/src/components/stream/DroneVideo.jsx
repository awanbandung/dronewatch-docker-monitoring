import { useEffect, useRef } from 'react'

async function startWhep(whepUrl, videoEl) {
  const pc = new RTCPeerConnection()
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })

  pc.ontrack = (e) => {
    if (e.track.kind === 'video') videoEl.srcObject = e.streams[0]
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  const res = await fetch(whepUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: offer.sdp,
  })

  if (!res.ok) throw new Error(`WHEP ${res.status}`)
  const sdp = await res.text()
  await pc.setRemoteDescription({ type: 'answer', sdp })
  return pc
}

export default function DroneVideo({ streamUrl, inactive = false, className = '', style = {} }) {
  const videoRef = useRef(null)
  const pcRef    = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || inactive || !streamUrl) return

    startWhep(streamUrl, video)
      .then(pc => { pcRef.current = pc })
      .catch(() => {})  // stream offline — video stays blank

    return () => {
      pcRef.current?.close()
      pcRef.current = null
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
      autoPlay
      muted
      playsInline
    />
  )
}
