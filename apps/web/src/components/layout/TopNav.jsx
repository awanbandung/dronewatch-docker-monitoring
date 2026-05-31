// src/components/layout/TopNav.jsx
import { useRef, useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useClock } from '@/hooks/useClock.js'

const TABS = [
  { path: '/dashboard', icon: '⊞', label: 'DASHBOARD',       shortcutKey: '1' },
  { path: '/streaming', icon: '▶', label: 'STREAMING',       shortcutKey: '2' },
  { path: '/gps',       icon: '◎', label: 'GPS TRACKER',     shortcutKey: '3', disabled: true },
  { path: '/inventory', icon: '≡', label: 'INVENTORY ASSET', shortcutKey: '4', disabled: true },
]

export default function TopNav({ streamCount = 47 }) {
  const { time } = useClock()
  const navigate = useNavigate()
  const operator = localStorage.getItem('dw_operator') || 'OPS-ADMIN1'
  const level    = localStorage.getItem('dw_level')    || 'COMMANDER'

  const [open, setOpen]           = useState(false)
  const [ctrlHeld, setCtrlHeld]   = useState(false)
  const dropRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Global nav shortcuts: Ctrl+1-4
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Control') { setCtrlHeld(true); return }
      if (!e.ctrlKey) return
      const tab = TABS.find(t => t.shortcutKey === e.key)
      if (!tab) return
      e.preventDefault()
      if (!tab.disabled) navigate(tab.path)
    }
    function onKeyUp(e) {
      if (e.key === 'Control') setCtrlHeld(false)
    }
    function onBlur() { setCtrlHeld(false) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup',   onKeyUp)
    window.addEventListener('blur',      onBlur)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup',   onKeyUp)
      window.removeEventListener('blur',      onBlur)
    }
  }, [navigate])

  function terminateSession() {
    localStorage.removeItem('dw_operator')
    localStorage.removeItem('dw_level')
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-stretch h-[42px]"
         style={{ background: '#0f1319', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 shrink-0"
           style={{ borderRight: '1px solid rgba(255,255,255,0.10)' }}>
        <BrandIcon />
        <span className="hd font-bold text-sm tracking-[3px] uppercase text-[#dde4ef]">
          R3
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-stretch flex-1">
        {TABS.map(tab => (
          <TabItem key={tab.path} {...tab} ctrlHeld={ctrlHeld} />
        ))}
      </div>

      {/* Right info */}
      <div className="flex items-center gap-4 px-4 shrink-0 ml-auto"
           style={{ borderLeft: '1px solid rgba(255,255,255,0.10)' }}>
        <span className="live-badge">● LIVE</span>
        <span className="mono text-[9px] text-[#6b7b90] tracking-wide">
          {streamCount} STREAMS
        </span>

        {/* Clickable operator badge */}
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className="mono text-[9px] text-[#6b7b90] tracking-wide flex items-center gap-1.5 px-2 py-1 rounded-sm transition-colors hover:text-[#dde4ef]"
            style={{ border: open ? '1px solid rgba(0,200,240,0.3)' : '1px solid transparent' }}>
            OPR: {operator}
            <span style={{ fontSize: 7, opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[200px] rounded-sm py-2"
                 style={{ background: '#141922', border: '1px solid rgba(0,200,240,0.2)', zIndex: 100 }}>
              {/* Top accent */}
              <div className="absolute top-[-1px] left-4 right-4 h-[1px]"
                   style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

              <div className="px-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="mono text-[11px] text-[#dde4ef] tracking-wide">{operator}</div>
                <div className="mono text-[9px] text-[#6b7b90] tracking-[1px] mt-0.5">
                  LEVEL: {level}
                </div>
              </div>

              <button
                onClick={terminateSession}
                className="w-full text-left px-3 py-2 mono text-[10px] tracking-[1px] transition-all group"
                style={{ color: '#6b7b90' }}
                onMouseEnter={e => Object.assign(e.currentTarget.style, { color: 'var(--danger)', background: 'rgba(255,64,64,0.07)' })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { color: '#6b7b90',        background: 'transparent' })}>
                ▶ TERMINATE SESSION
              </button>
            </div>
          )}
        </div>

        <span className="mono text-[9px] tracking-wide" style={{ color: 'var(--accent)' }}>
          {time}
        </span>
      </div>
    </nav>
  )
}

function ShortcutBadge({ shortcutKey, dim }) {
  return (
    <span className="mono text-[7px] ml-1.5 px-1 rounded"
          style={{
            background: dim ? 'rgba(255,255,255,0.05)' : 'var(--accent-dim)',
            color: dim ? '#4a5568' : 'var(--accent)',
            border: `1px solid ${dim ? 'rgba(255,255,255,0.08)' : 'rgba(0,200,240,0.3)'}`,
            letterSpacing: '1px',
          }}>
      ^{shortcutKey}
    </span>
  )
}

function TabItem({ path, icon, label, shortcutKey, disabled, ctrlHeld }) {
  if (disabled) {
    return (
      <span className="nav-tab opacity-40 cursor-not-allowed select-none"
            title="Coming soon">
        <span className="text-[10px]">{icon}</span>
        {label}
        {ctrlHeld
          ? <ShortcutBadge shortcutKey={shortcutKey} dim />
          : <span className="mono text-[7px] ml-1 px-1 rounded"
                  style={{ background: 'rgba(240,165,0,0.15)', color: 'var(--warning)',
                           border: '1px solid rgba(240,165,0,0.25)', letterSpacing: '1px' }}>
              SOON
            </span>
        }
      </span>
    )
  }
  return (
    <NavLink to={path}
      className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
      title={`Ctrl+${shortcutKey}`}>
      <span className="text-[10px]">{icon}</span>
      {label}
      {ctrlHeld && <ShortcutBadge shortcutKey={shortcutKey} />}
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
