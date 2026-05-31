// src/components/stream/DroneThumb.jsx
import { useState } from 'react'
import DroneVideo from './DroneVideo.jsx'
import { STATUS_COLORS } from '@/data/drones.js'

const BORDER_COLORS = {
  green:    'rgba(0,230,118,0.45)',
  yellow:   'rgba(240,165,0,0.45)',
  red:      'rgba(255,64,64,0.45)',
  inactive: 'rgba(74,85,104,0.35)',
}

export default function DroneThumb({
  drone,
  selected = false,   // focused pane
  pinned   = false,   // in multi-view (but not focused)
  onClick  = () => {},
  width    = 110,
  height   = 68,
}) {
  const [hovered, setHovered] = useState(false)

  const borderColor = selected ? 'var(--accent)'
    : hovered          ? 'rgba(0,200,240,0.55)'
    : pinned           ? 'rgba(0,200,240,0.35)'
    : BORDER_COLORS[drone.status]

  const borderWidth = selected || hovered ? '2px' : '1px'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative shrink-0 cursor-pointer overflow-hidden rounded-sm transition-transform duration-150 hover:scale-105"
      style={{
        width,
        height,
        border: `${borderWidth} solid ${borderColor}`,
        background: '#131820',
        opacity: drone.status === 'inactive' ? 0.55 : 1,
        transition: 'border-color 0.15s ease, border-width 0.15s ease',
      }}
    >
      <DroneVideo
        streamUrl={drone.stream_url}
        inactive={drone.status === 'inactive'}
        style={{ width, height, objectFit: 'cover' }}
      />

      {/* REC badge or pinned indicator — share top-right slot */}
      {(drone.recording || pinned) && (
        <div className="absolute top-[3px] right-[4px] mono text-[7px] px-1 rounded-sm"
             style={{
               color: drone.recording ? 'var(--danger)' : 'var(--accent)',
               background: 'rgba(0,0,0,0.65)',
               animation: drone.recording ? 'livePulse 1.2s ease-in-out infinite' : 'none',
             }}>
          {drone.recording ? '● REC' : '◈'}
        </div>
      )}

      {/* Battery badge */}
      <div className="absolute top-[3px] left-[4px] mono text-[7px] px-1 rounded-sm"
           style={{
             background: 'rgba(0,0,0,0.65)',
             color: drone.status === 'red' ? '#6b7b90'
                  : drone.battery > 50     ? 'var(--success)'
                  : drone.battery > 20     ? 'var(--warning)'
                  :                          'var(--danger)',
           }}>
        {drone.status === 'inactive' ? 'STBY'
         : drone.status === 'red'    ? 'N/A'
         : `${drone.battery}%`}
      </div>

      {/* Label bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-1 py-0.5"
           style={{ background: 'rgba(0,0,0,0.75)' }}>
        <span className="mono truncate"
              style={{ fontSize: '7.5px', color: '#8aa0b4', letterSpacing: '0.3px' }}>
          {drone.area.toUpperCase()} / D{drone.droneNum}
        </span>
        <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-1"
              style={{ background: STATUS_COLORS[drone.status] }} />
      </div>
    </div>
  )
}
