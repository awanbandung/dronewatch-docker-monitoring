// src/components/layout/BottomBar.jsx
import { useClock } from '@/hooks/useClock.js'

export default function BottomBar({
  operator   = 'CDR-NDUGA-01',
  accessLevel = 'COMMANDER',
  streamCount = 47,
}) {
  const { time, date } = useClock()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4"
         style={{
           height: '28px',
           background: 'rgba(10,13,20,0.97)',
           borderTop: '1px solid rgba(255,255,255,0.10)',
         }}>
      <div className="flex items-center gap-5 mono text-[9px] text-[#6b7b90] tracking-wide">
        <span><span className="status-dot dot-green" />SERVER: OVH-BM-JKT-01 ONLINE</span>
        <span><span className="status-dot dot-cyan"  />LIVEKIT: {streamCount} STREAMS ACTIVE</span>
        <span><span className="status-dot dot-green" />DB: CONNECTED</span>
        <span><span className="status-dot dot-yellow"/>MQTT: 3 QUEUE PENDING</span>
      </div>
      <div className="flex items-center gap-5 mono text-[9px] text-[#6b7b90] tracking-wide">
        <span>OPR: {operator} &nbsp;|&nbsp; LEVEL: {accessLevel}</span>
        <span style={{ color: 'var(--accent)' }}>{time} · {date}</span>
      </div>
    </div>
  )
}
