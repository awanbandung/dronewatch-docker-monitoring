// src/pages/ComingSoon.jsx
import { useNavigate } from 'react-router-dom'
import TopNav    from '@/components/layout/TopNav.jsx'
import BottomBar from '@/components/layout/BottomBar.jsx'

export default function ComingSoon({ title = 'Feature' }) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0b0e14' }}>
      <TopNav />
      <div className="flex flex-1 items-center justify-center" style={{ marginTop: 42, marginBottom: 28 }}>
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <span style={{ fontSize: 28 }}>⌛</span>
          </div>

          {/* Label */}
          <div>
            <div className="mono text-[9px] tracking-[3px] uppercase mb-2" style={{ color: 'var(--warning)' }}>
              PHASE 2 — UPCOMING FEATURE
            </div>
            <div className="hd font-bold text-[26px] tracking-[4px] uppercase text-[#dde4ef]">
              {title}
            </div>
          </div>

          <div className="mono text-[10px] text-[#6b7b90] tracking-[1px] max-w-xs leading-relaxed">
            This module is scheduled for Phase 2 development.<br/>
            It will be enabled once the current phase is complete.
          </div>

          {/* Divider */}
          <div className="w-40 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>

          {/* Phase list */}
          <div className="flex flex-col gap-2 items-start">
            {[
              { label: 'Phase 1 — Live Streaming (50 drones)', done: true },
              { label: 'Phase 2 — GPS Tracker',               done: false, active: title === 'GPS Tracker' },
              { label: 'Phase 2 — Inventory Asset',           done: false, active: title === 'Inventory Asset' },
              { label: 'Phase 3 — AI Detection (YOLOv8)',     done: false },
              { label: 'Phase 3 — Remote Control (MAVLink)',  done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 mono text-[9px] tracking-[0.5px]"
                   style={{ color: item.done ? 'var(--success)' : item.active ? 'var(--warning)' : '#4a5568' }}>
                <span>{item.done ? '✓' : item.active ? '◉' : '○'}</span>
                {item.label}
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/dashboard')}
                  className="mt-2 px-6 py-2 rounded-sm hd font-semibold text-[13px] tracking-[3px] uppercase transition-colors"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,200,240,0.35)',
                    color: 'var(--accent)',
                  }}>
            ← BACK TO DASHBOARD
          </button>
        </div>
      </div>
      <BottomBar />
    </div>
  )
}
