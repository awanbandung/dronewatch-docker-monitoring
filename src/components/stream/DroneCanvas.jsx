// src/components/stream/DroneCanvas.jsx
// Simulates an aerial drone feed.
// Phase D: replace with LiveKit <VideoTrack /> component
import { useEffect, useRef } from 'react'

export default function DroneCanvas({
  hue     = 105,
  noisy   = false,
  inactive = false,
  className = '',
  style   = {},
}) {
  const canvasRef = useRef(null)
  const aliveRef  = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    const cv  = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    let frame = 0

    function draw() {
      if (!aliveRef.current) return
      const w = cv.width, h = cv.height
      if (!w || !h) { requestAnimationFrame(draw); return }

      if (inactive) {
        ctx.fillStyle = '#0d1018'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = 'rgba(74,85,104,0.15)'
        ctx.fillRect(0, 0, w, h)
        ctx.font = `${Math.max(9, w * 0.07)}px Share Tech Mono, monospace`
        ctx.fillStyle = 'rgba(74,85,104,0.5)'
        ctx.textAlign = 'center'
        ctx.fillText('STANDBY', w / 2, h / 2 + 4)
        requestAnimationFrame(draw)
        return
      }

      // Terrain base
      ctx.fillStyle = `hsl(${hue},18%,7%)`
      ctx.fillRect(0, 0, w, h)

      // Terrain noise blocks
      const blockCount = Math.floor(w * h * 0.012)
      for (let i = 0; i < blockCount; i++) {
        const x = Math.random() * w
        const y = Math.random() * h
        const s = Math.random() * (w * 0.025) + 2
        const l = Math.random() * 26 + 4
        ctx.fillStyle = `hsla(${hue + Math.random() * 25 - 12},${15 + Math.random() * 35}%,${l}%,0.55)`
        ctx.fillRect(x, y, s, s * 0.65)
      }

      // Horizon line
      const hy = h * (0.38 + Math.sin(frame * 0.002) * 0.04)
      ctx.strokeStyle = `hsla(${hue},25%,35%,0.3)`
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke()

      // Vignette
      const vg = ctx.createRadialGradient(w/2, h/2, h*0.15, w/2, h/2, h*0.85)
      vg.addColorStop(0, 'transparent')
      vg.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      // Glitch for lost signal
      if (noisy) {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`
          ctx.fillRect(0, Math.random() * h, w, 1)
        }
        ctx.fillStyle = 'rgba(255,40,40,0.06)'
        ctx.fillRect(0, 0, w, h)
      }

      // Crosshair
      ctx.strokeStyle = 'rgba(0,200,240,0.22)'
      ctx.lineWidth = 0.6
      const cx = w / 2, cy = h / 2, cs = w * 0.06
      ctx.beginPath()
      ctx.moveTo(cx - cs, cy); ctx.lineTo(cx + cs, cy)
      ctx.moveTo(cx, cy - cs); ctx.lineTo(cx, cy + cs)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, cs * 0.5, 0, Math.PI * 2)
      ctx.stroke()

      frame++
      requestAnimationFrame(draw)
    }

    draw()
    return () => { aliveRef.current = false }
  }, [hue, noisy, inactive])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}
