// src/components/layout/TopNav.jsx
import { NavLink } from 'react-router-dom'
import { useClock } from '@/hooks/useClock.js'

const TABS = [
  { path: '/dashboard', icon: '⊞', label: 'DASHBOARD' },
  { path: '/streaming', icon: '▶', label: 'STREAMING' },
  { path: '/gps',       icon: '◎', label: 'GPS TRACKER',     disabled: true },
  { path: '/inventory', icon: '≡', label: 'INVENTORY ASSET', disabled: true },
]

export default function TopNav({ operator = 'CDR-NDUGA-01', streamCount = 47 }) {
  const { time } = useClock()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-stretch h-[42px]"
         style={{ background: '#0f1319', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 shrink-0"
           style={{ borderRight: '1px solid rgba(255,255,255,0.10)' }}>
        <BrandIcon />
        <span className="hd font-bold text-sm tracking-[3px] uppercase text-[#dde4ef]">
          DroneWatch
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-stretch flex-1">
        {TABS.map(tab => (
          <TabItem key={tab.path} {...tab} />
        ))}
      </div>

      {/* Right info */}
      <div className="flex items-center gap-4 px-4 shrink-0 ml-auto"
           style={{ borderLeft: '1px solid rgba(255,255,255,0.10)' }}>
        <span className="live-badge">● LIVE</span>
        <span className="mono text-[9px] text-[#6b7b90] tracking-wide">
          {streamCount} STREAMS
        </span>
        <span className="mono text-[9px] text-[#6b7b90] tracking-wide">
          OPR: {operator}
        </span>
        <span className="mono text-[9px] tracking-wide" style={{ color: 'var(--accent)' }}>
          {time}
        </span>
      </div>
    </nav>
  )
}

function TabItem({ path, icon, label, disabled }) {
  if (disabled) {
    return (
      <span className="nav-tab opacity-40 cursor-not-allowed select-none"
            title="Coming soon">
        <span className="text-[10px]">{icon}</span>
        {label}
        <span className="mono text-[7px] ml-1 px-1 rounded"
              style={{ background: 'rgba(240,165,0,0.15)', color: 'var(--warning)',
                       border: '1px solid rgba(240,165,0,0.25)', letterSpacing: '1px' }}>
          SOON
        </span>
      </span>
    )
  }
  return (
    <NavLink to={path}
      className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
      <span className="text-[10px]">{icon}</span>
      {label}
    </NavLink>
  )
}

function BrandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L21 6 L21 13 C21 17.5 17 21 12 22.5 C7 21 3 17.5 3 13 L3 6 Z"
        fill="rgba(0,200,240,0.08)" stroke="rgba(0,200,240,0.5)" strokeWidth="0.8"/>
      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="rgba(0,200,240,0.9)"/>
      <rect x="5"  y="11" width="5" height="2" rx="0.5" fill="rgba(0,200,240,0.6)"/>
      <rect x="14" y="11" width="5" height="2" rx="0.5" fill="rgba(0,200,240,0.6)"/>
      <circle cx="5"  cy="9"  r="1.2" fill="rgba(0,200,240,0.9)"/>
      <circle cx="19" cy="9"  r="1.2" fill="rgba(0,200,240,0.9)"/>
      <circle cx="5"  cy="15" r="1.2" fill="rgba(0,200,240,0.9)"/>
      <circle cx="19" cy="15" r="1.2" fill="rgba(0,200,240,0.9)"/>
    </svg>
  )
}
