import { useEffect, useRef } from 'react'

async function startWhep(whepUrl, videoEl) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  })
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })

  pc.ontrack = (e) => {
    if (e.track.kind === 'video') videoEl.srcObject = e.streams[0]
  }

  pc.onconnectionstatechange = () => {
    console.log(`[WHEP] ${whepUrl.split('/').at(-2)} →`, pc.connectionState)
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  // Wait for ICE gathering to complete so candidates are in the SDP
  await new Promise(resolve => {
    if (pc.iceGatheringState === 'complete') { resolve(); return }
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') resolve()
    }
    setTimeout(resolve, 5000) // fallback: proceed after 5s
  })

  const res = await fetch(whepUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: pc.localDescription.sdp, // full SDP with ICE candidates
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

    let closed = false
    startWhep(streamUrl, video)
      .then(pc => {
        if (closed) { pc.close(); return }
        pcRef.current = pc
      })
      .catch(() => {})  // stream offline — video stays blank

    return () => {
      closed = true
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
