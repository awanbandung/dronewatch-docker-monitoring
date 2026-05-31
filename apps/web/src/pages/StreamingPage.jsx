// src/pages/StreamingPage.jsx
import { useState, useRef, useEffect } from 'react'
import TopNav    from '@/components/layout/TopNav.jsx'
import BottomBar from '@/components/layout/BottomBar.jsx'
import DroneVideo  from '@/components/stream/DroneVideo.jsx'
import DroneThumb  from '@/components/stream/DroneThumb.jsx'
import { STATUS_COLORS, STATUS_LABELS, formatFlightTime, formatUptime } from '@/data/drones.js'
import { useTelemetry } from '@/hooks/useTelemetry.js'
import { useDrones } from '@/hooks/useDrones.js'

function padZ(n) { return String(n).padStart(2, '0') }

const DRONE_LOGS = [
  { msg: 'Battery level under 50% — consider RTH', level: 'warn', time: '10:32:18' },
  { msg: 'Geofence checkpoint passed — Zone Alpha',  level: '',     time: '10:28:05' },
  { msg: 'Waypoint 4 of 7 reached',                  level: '',     time: '10:22:41' },
  { msg: 'Signal degraded — RSSI below threshold',   level: 'crit', time: '10:18:30' },
  { msg: 'Drone deployed — mission started',          level: '',     time: '08:18:01' },
]

// Pane FPS budget: fewer panes = richer animation
function paneFps(n) { return n === 1 ? 60 : n <= 4 ? 24 : 12 }

export default function StreamingPage() {
  const { drones, loading } = useDrones()
  const [pinnedDrones, setPinnedDrones] = useState([])
  const [focusedDrone, setFocusedDrone] = useState(null)
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [recording, setRecording]       = useState(false)
  const [recSec, setRecSec]             = useState(0)
  const [snapFlash, setSnapFlash]       = useState(false)
  const [snapNotify, setSnapNotify]     = useState(false)
  const [filterOpen, setFilterOpen]     = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery]   = useState('')
  const [sortAsc, setSortAsc]           = useState(true)
  const [flightSec, setFlightSec]       = useState(0)
  const [gridOpen, setGridOpen]         = useState(false)
  const [stopConfirm, setStopConfirm]   = useState(false)
  const [feedFocused, setFeedFocused]   = useState(false)

  // Initialise pinned/focused once drones load
  useEffect(() => {
    if (drones.length && pinnedDrones.length === 0) {
      setPinnedDrones([drones[0]])
      setFocusedDrone(drones[0])
      setFlightSec(drones[0].flightSec)
    }
  }, [drones])

  const recTimerRef    = useRef(null)
  const stopConfirmRef = useRef(null)

  const N    = pinnedDrones.length
  const cols = Math.ceil(Math.sqrt(N))
  const rows = Math.ceil(N / cols)
  const fps  = paneFps(N)

  const telem = useTelemetry(focusedDrone)

  const fleetCounts = {
    green:    drones.filter(d => d.status === 'green').length,
    yellow:   drones.filter(d => d.status === 'yellow').length,
    red:      drones.filter(d => d.status === 'red').length,
    inactive: drones.filter(d => d.status === 'inactive').length,
  }

  useEffect(() => {
    if (!focusedDrone) return
    setFlightSec(focusedDrone.flightSec)
    const id = setInterval(() => setFlightSec(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [focusedDrone?.id])

  // Reset recording when focused pane changes
  useEffect(() => {
    if (!focusedDrone) return
    setRecording(false)
    setRecSec(0)
    clearTimeout(stopConfirmRef.current)
    setStopConfirm(false)
  }, [focusedDrone?.id])

  useEffect(() => {
    if (recording) {
      setRecSec(0)
      recTimerRef.current = setInterval(() => setRecSec(s => s + 1), 1000)
    } else {
      clearInterval(recTimerRef.current)
    }
    return () => clearInterval(recTimerRef.current)
  }, [recording])

  useEffect(() => {
    if (searchQuery || filterOpen) setGridOpen(true)
  }, [searchQuery, filterOpen])

  // Wall mode threshold — auto-collapse chrome, clear stale hover state
  useEffect(() => {
    if (N === 5) { setSidebarOpen(false); setGridOpen(false) }
    if (N > 1) setFeedFocused(false)
  }, [N])

  useEffect(() => () => clearTimeout(stopConfirmRef.current), [])

  // Streaming-page shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      if (!e.ctrlKey) return
      if (e.key === 'g' || e.key === 'G') { e.preventDefault(); setGridOpen(v => !v) }
      if (e.key === 'b' || e.key === 'B') { e.preventDefault(); setSidebarOpen(v => !v) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handlePinDrone(drone) {
    const alreadyPinned = pinnedDrones.some(d => d.id === drone.id)
    if (alreadyPinned) { setFocusedDrone(drone); return }
    setPinnedDrones(prev => [...prev, drone])
    setFocusedDrone(drone)
  }

  function handleUnpinDrone(droneId) {
    setPinnedDrones(prev => {
      if (prev.length === 1) return prev // keep at least one pane
      const next = prev.filter(d => d.id !== droneId)
      setFocusedDrone(cur => cur.id === droneId ? next[next.length - 1] : cur)
      return next
    })
  }

  function handleRecord() {
    if (!recording) { setRecording(true); return }
    if (!stopConfirm) {
      setStopConfirm(true)
      stopConfirmRef.current = setTimeout(() => setStopConfirm(false), 3000)
    } else {
      clearTimeout(stopConfirmRef.current)
      setStopConfirm(false)
      setRecording(false)
    }
  }

  function doSnapshot() {
    setSnapFlash(true)
    setTimeout(() => setSnapFlash(false), 120)
    setSnapNotify(true)
    setTimeout(() => setSnapNotify(false), 2200)
  }

  const filteredDrones = drones
    .filter(d => {
      const matchFilter = activeFilter === 'all' || d.status === activeFilter
      const q = searchQuery.toLowerCase()
      const matchSearch = !q || d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
    .sort((a, b) => sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id))

  const pinnedIds = new Set(pinnedDrones.map(d => d.id))  // O(1) lookup per thumbnail

  const recLabel = recording ? `${padZ(Math.floor(recSec / 60))}:${padZ(recSec % 60)}` : 'RECORD'
  const batColor = !telem ? 'var(--success)'
    : telem.bat > 50 ? 'var(--success)'
    : telem.bat > 20 ? 'var(--warning)'
    : 'var(--danger)'

  if (loading || !focusedDrone) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0b0e14' }}>
        <span className="mono text-[11px] tracking-[3px]" style={{ color: 'var(--accent)' }}>
          LOADING FLEET...
        </span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0b0e14' }}>
      <TopNav />

      <div className="fixed left-0 right-0 flex flex-col" style={{ top: 42, bottom: 28 }}>

        {/* Top section: pane area + sidebar */}
        <div className="flex flex-1 min-h-0">

          {/* ── Pane area ── */}
          {N === 1 ? (
            /* Single pane — full HUD */
            <div className="flex-1 relative overflow-hidden"
                 style={{ background: '#000' }}
                 onMouseEnter={() => setFeedFocused(true)}
                 onMouseLeave={() => setFeedFocused(false)}>

              <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3"
                   style={{ height: 30, background: 'linear-gradient(180deg,rgba(0,0,0,0.85),transparent)' }}>
                <span className="mono text-[11px] text-[#dde4ef] tracking-[1px]">Nduga</span>
                <span className="mono text-[10px] text-[#6b7b90]">/</span>
                <span className="mono text-[11px] text-[#dde4ef]">{focusedDrone.area}</span>
                <span className="mono text-[10px] text-[#6b7b90]">/</span>
                <span className="mono text-[11px] tracking-[1px]" style={{ color: 'var(--accent)' }}>
                  Drone {focusedDrone.droneNum}
                </span>
              </div>

              <DroneVideo
                streamUrl={focusedDrone.stream_url}
                inactive={focusedDrone.status === 'inactive'}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />

              {/* HUD dims when mouse leaves feed */}
              <div className="absolute inset-0 z-10 pointer-events-none"
                   style={{ opacity: feedFocused ? 1 : 0.4, transition: 'opacity 0.4s ease' }}>

                <div className="absolute flex flex-col gap-1" style={{ top: 36, left: 10 }}>
                  <HudBox label="RSSI KOMLEK">
                    <div className="flex items-end gap-0.5">
                      {[6,9,12,15,18].map((h,i) => (
                        <div key={i} style={{
                          width: 4, height: h,
                          background: i < (telem?.rssi ?? 3) ? 'var(--success)' : 'rgba(255,255,255,0.15)',
                          borderRadius: 1,
                        }}/>
                      ))}
                    </div>
                  </HudBox>
                  <HudBox label="STATUS">
                    <span className="mono text-[11px] tracking-[1px]"
                          style={{ color: STATUS_COLORS[focusedDrone.status] }}>
                      {telem?.status ?? focusedDrone.flightStatus}
                    </span>
                  </HudBox>
                </div>

                <div className="absolute flex flex-col gap-0.5" style={{ top: 36, right: 10 }}>
                  {[
                    { label: 'GPS KOORDINAT', value: telem ? `${telem.lat.toFixed(4)}, ${telem.lon.toFixed(4)}` : '—', unit: '', small: true },
                    { label: 'KETINGGIAN',    value: telem ? Math.round(telem.alt) : '—', unit: 'm AGL' },
                    { label: 'KECEPATAN',     value: telem ? Math.round(telem.spd) : '—', unit: 'km/h'  },
                    { label: 'BATTERY',       value: telem ? Math.round(telem.bat) : '—', unit: '%', color: batColor },
                    { label: 'MSL ALT',       value: telem ? Math.round(telem.msl) : '—', unit: 'm' },
                  ].map(row => (
                    <div key={row.label} className="flex items-baseline gap-2 px-2 py-1 rounded-sm"
                         style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.10)', minWidth: 180 }}>
                      <span className="mono text-[8px] text-[#6b7b90] tracking-[1px] flex-1">{row.label}</span>
                      <span className="mono tracking-[1px] text-right"
                            style={{ fontSize: row.small ? 10 : 12, color: row.color ?? 'var(--accent)' }}>
                        {row.value}
                      </span>
                      {row.unit && <span className="mono text-[8px] text-[#6b7b90]">{row.unit}</span>}
                    </div>
                  ))}
                </div>

                <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60 }}>
                  <svg viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="12" stroke="rgba(0,200,240,0.5)" strokeWidth="0.8"/>
                    <circle cx="30" cy="30" r="3"  stroke="rgba(0,200,240,0.7)" strokeWidth="0.8"/>
                    <line x1="30" y1="0"  x2="30" y2="16" stroke="rgba(0,200,240,0.4)" strokeWidth="0.8"/>
                    <line x1="30" y1="44" x2="30" y2="60" stroke="rgba(0,200,240,0.4)" strokeWidth="0.8"/>
                    <line x1="0"  y1="30" x2="16" y2="30" stroke="rgba(0,200,240,0.4)" strokeWidth="0.8"/>
                    <line x1="44" y1="30" x2="60" y2="30" stroke="rgba(0,200,240,0.4)" strokeWidth="0.8"/>
                  </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2"
                     style={{ height: 52, background: 'linear-gradient(0deg,rgba(0,0,0,0.85),transparent)' }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
                           style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '6px solid var(--accent)' }}/>
                      <div className="flex items-center overflow-hidden rounded-sm px-1.5 py-1"
                           style={{ width: 180, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.10)' }}>
                        {['W','300','315','330','N','030','045'].map((t,i) => (
                          <span key={i} className="mono text-center flex-1"
                                style={{ fontSize: i===4?10:9, color: i===4?'var(--accent)':'#6b7b90' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="mono text-[8px] text-[#6b7b90]">
                      HDG: <span style={{ color: 'var(--accent)' }}>{telem ? String(Math.round(telem.hdg)).padStart(3,'0') : '007'}°</span>
                    </span>
                  </div>

                  <div className="flex items-end gap-3">
                    {[
                      { value: telem ? (telem.spd / 3.6).toFixed(1) : '0.0', label: 'm/s',   color: '#dde4ef' },
                      { value: telem ? telem.alt.toFixed(1) : '0.0',           label: 'm AGL', color: 'var(--accent)' },
                      { value: telem ? telem.msl.toFixed(1) : '0.0',           label: 'm MSL', color: '#dde4ef' },
                    ].map((r,i) => (
                      <div key={i} className="flex flex-col items-end">
                        <span className="hd font-bold leading-none" style={{ fontSize: 26, color: r.color }}>{r.value}</span>
                        <span className="mono text-[8px] tracking-[2px] mt-0.5"
                              style={{ color: r.color === '#dde4ef' ? '#6b7b90' : r.color }}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span className="mono text-[8px] text-[#6b7b90]">FLIGHT TIME</span>
                    <span className="mono text-sm text-[#dde4ef]">{formatFlightTime(flightSec)}</span>
                  </div>
                </div>
              </div>

              {/* Controls — single pane only */}
              <div className="absolute z-20 flex gap-2.5 pointer-events-auto"
                   style={{ bottom: 60, left: '50%', transform: 'translateX(-50%)' }}>
                <button onClick={handleRecord}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm mono text-[10px] tracking-[2px] transition-colors"
                        style={{
                          background: stopConfirm ? 'rgba(255,64,64,0.45)' : recording ? 'rgba(255,64,64,0.3)' : 'rgba(255,64,64,0.15)',
                          border: `1px solid ${recording ? 'var(--danger)' : 'rgba(255,64,64,0.4)'}`,
                          color: 'var(--danger)',
                          outline: stopConfirm ? '1px solid rgba(255,64,64,0.6)' : 'none',
                          outlineOffset: 2,
                        }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{
                    background: 'var(--danger)',
                    animation: recording ? 'livePulse 0.8s ease-in-out infinite' : 'none',
                  }}/>
                  {stopConfirm ? 'CONFIRM STOP?' : recLabel}
                </button>
                <button onClick={doSnapshot}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm mono text-[10px] tracking-[2px] transition-colors"
                        style={{ background: 'rgba(0,200,240,0.08)', border: '1px solid rgba(0,200,240,0.28)', color: 'var(--accent)' }}>
                  ⊙ SNAPSHOT
                </button>
              </div>

              {snapFlash && <div className="absolute inset-0 z-30 bg-white" style={{ opacity: 0.6 }}/>}
            </div>
          ) : (
            /* Multi-view grid */
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              minHeight: 0,
              overflow: 'hidden',
              gap: 1,
              background: '#0b0e14',
            }}>
              {pinnedDrones.map(drone => (
                <DronePane
                  key={drone.id}
                  drone={drone}
                  focused={drone.id === focusedDrone.id}
                  fps={fps}
                  onFocus={() => setFocusedDrone(drone)}
                  onUnpin={() => handleUnpinDrone(drone.id)}
                />
              ))}
            </div>
          )}

          {/* ── Sidebar ── */}
          {sidebarOpen && (
            <div className="w-[280px] shrink-0 flex flex-col overflow-hidden"
                 style={{ background: '#0f1319', position: 'relative' }}>

              {N > 1 && (
                <button onClick={() => setSidebarOpen(false)}
                        className="absolute top-2 right-2 z-10 mono text-[8px] px-1.5 py-0.5 rounded-sm"
                        style={{ background: '#0f1319', border: '1px solid rgba(255,255,255,0.10)', color: '#6b7b90' }}>
                  ◁ HIDE
                </button>
              )}

              <div className="sec-hd flex-shrink-0">
                <div className="sec-title"><div className="sec-dot" style={{ background: 'var(--accent)' }}/>PETA NAVIGASI</div>
                <span className="mono text-[8px] px-1.5 py-0.5 rounded-sm"
                      style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#6b7b90' }}>
                  {telem ? `${telem.lat.toFixed(3)}° / ${telem.lon.toFixed(3)}°` : '—'}
                </span>
              </div>
              <div className="flex-1 relative min-h-0 overflow-hidden" style={{ background: '#0c1a0c' }}>
                <MiniMap telem={telem} drone={focusedDrone}/>
              </div>

              <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div className="sec-hd">
                  <div className="sec-title"><div className="sec-dot" style={{ background: 'var(--success)' }}/>DRONE SUMMARY</div>
                  <span className="status-badge">{focusedDrone.id}</span>
                </div>
                <div className="px-3 py-2 flex flex-col gap-0.5">
                  {[
                    { key: 'Serial Number',     val: focusedDrone.serial,                             color: 'var(--accent)'                      },
                    { key: 'Operator ID',        val: focusedDrone.operatorId                                                                      },
                    { key: 'Uptime',             val: formatUptime(flightSec)                                                                       },
                    { key: 'Status Penerbangan', val: STATUS_LABELS[focusedDrone.status],             color: STATUS_COLORS[focusedDrone.status]    },
                    { key: 'Type',               val: focusedDrone.type                                                                             },
                    { key: 'Area',               val: focusedDrone.area                                                                             },
                  ].map(row => (
                    <div key={row.key} className="flex items-baseline py-1"
                         style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="mono text-[9px] text-[#6b7b90] tracking-[1px] flex-1">{row.key}</span>
                      <span className="mono text-[10px] text-right" style={{ color: row.color ?? '#dde4ef' }}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div className="sec-hd">
                  <div className="sec-title">
                    <div className="sec-dot" style={{ background: 'var(--warning)', animationDuration: '0.8s' }}/>
                    DRONE LOG
                  </div>
                </div>
                <div className="px-3 py-1.5 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 100 }}>
                  {DRONE_LOGS.map((log, i) => (
                    <div key={i}>
                      <div className="mono text-[9px] leading-snug"
                           style={{ color: log.level === 'warn' ? 'var(--warning)' : log.level === 'crit' ? 'var(--danger)' : '#8aa0b4' }}>
                        {log.msg}
                      </div>
                      <div className="mono text-[8px] text-[#6b7b90]">{log.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar reopen tab */}
          {N > 1 && !sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 18,
                      background: '#0f1319',
                      borderLeft: '1px solid rgba(255,255,255,0.08)',
                      color: '#6b7b90',
                    }}>
              <span className="mono text-[7px]"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 1 }}>
                ▶ SIDEBAR
              </span>
            </button>
          )}

        </div>

        {/* ── Drone Grid Strip ── */}
        <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)', background: '#0f1319' }}>

          <div className="flex items-center gap-3 px-3 py-1.5"
               style={{ borderBottom: gridOpen ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span className="mono text-[9px] text-[#6b7b90] tracking-[2px] whitespace-nowrap">FLEET</span>

            {!gridOpen && (
              <div className="flex items-center gap-4 flex-1">
                <span className="mono text-[9px] tracking-[1px]" style={{ color: 'var(--success)' }}>● {fleetCounts.green} ONLINE</span>
                <span className="mono text-[9px] tracking-[1px]" style={{ color: 'var(--warning)' }}>● {fleetCounts.yellow} LOW BAT</span>
                <span className="mono text-[9px] tracking-[1px]" style={{ color: 'var(--danger)'  }}>● {fleetCounts.red} LOST SIG</span>
                <span className="mono text-[9px] tracking-[1px]" style={{ color: '#4a5568'         }}>● {fleetCounts.inactive} STANDBY</span>
                {N > 1 && <span className="mono text-[9px] tracking-[1px]" style={{ color: 'var(--accent)' }}>◈ {N} PINNED</span>}
              </div>
            )}

            {gridOpen && (
              <>
                <span className="hd font-semibold text-[13px] text-[#dde4ef]">{filteredDrones.length} Drone</span>
                <input
                  className="mono text-[10px] h-6 px-2 rounded-sm outline-none flex-1 max-w-[180px]"
                  style={{ background: '#0d1018', border: '1px solid rgba(255,255,255,0.10)', color: '#dde4ef' }}
                  placeholder="SEARCH DRONE / AREA..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button onClick={() => setFilterOpen(v => !v)}
                        className="mono text-[9px] px-2 py-1 rounded-sm transition-colors"
                        style={{
                          background: 'transparent', letterSpacing: '1px',
                          border: `1px solid ${filterOpen ? 'rgba(0,200,240,0.28)' : 'rgba(255,255,255,0.10)'}`,
                          color: filterOpen ? 'var(--accent)' : '#6b7b90',
                        }}>
                  ▽ FILTER
                </button>
                <button onClick={() => setSortAsc(v => !v)}
                        className="mono text-[9px] px-2 py-1 rounded-sm transition-colors"
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: '#6b7b90', letterSpacing: '1px' }}>
                  ⇅ {sortAsc ? 'A→Z' : 'Z→A'}
                </button>
              </>
            )}

            <button onClick={() => setGridOpen(v => !v)}
                    className="mono text-[9px] px-2 py-1 rounded-sm ml-auto transition-colors"
                    style={{
                      background: gridOpen ? 'var(--accent-dim)' : 'transparent',
                      border: `1px solid ${gridOpen ? 'rgba(0,200,240,0.28)' : 'rgba(255,255,255,0.10)'}`,
                      color: gridOpen ? 'var(--accent)' : '#6b7b90',
                      letterSpacing: '1px',
                    }}>
              {gridOpen ? '▲ COLLAPSE' : '▼ DRONES'}
            </button>
          </div>

          {gridOpen && (
            <>
              {filterOpen && (
                <div className="flex gap-1.5 px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { key: 'all',      label: 'ALL',           activeStyle: { background: 'var(--accent-dim)',    border: '1px solid rgba(0,200,240,0.28)', color: 'var(--accent)'  } },
                    { key: 'green',    label: '● OPERASIONAL', activeStyle: { background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: 'var(--success)' } },
                    { key: 'yellow',   label: '● LOW BATTERY', activeStyle: { background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)', color: 'var(--warning)' } },
                    { key: 'red',      label: '● LOST SIGNAL', activeStyle: { background: 'rgba(255,64,64,0.1)', border: '1px solid rgba(255,64,64,0.3)', color: 'var(--danger)'  } },
                    { key: 'inactive', label: '● STANDBY',     activeStyle: { background: 'rgba(74,85,104,0.1)', border: '1px solid rgba(74,85,104,0.3)', color: '#6b7b90'        } },
                  ].map(f => (
                    <button key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className="mono text-[8px] px-2.5 py-0.5 rounded-sm transition-all"
                            style={activeFilter === f.key ? f.activeStyle : { border: '1px solid rgba(255,255,255,0.10)', color: '#6b7b90' }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-1.5 px-3 py-2 overflow-x-auto">
                {filteredDrones.map(drone => (
                  <DroneThumb
                    key={drone.id}
                    drone={drone}
                    selected={drone.id === focusedDrone.id}
                    pinned={pinnedIds.has(drone.id)}
                    onClick={() => handlePinDrone(drone)}
                    width={110}
                    height={68}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {snapNotify && (
        <div className="fixed z-50 mono text-[10px] px-3 py-1.5 rounded-sm tracking-[1px]"
             style={{ bottom: 40, right: 20, background: 'rgba(11,14,20,0.95)', border: '1px solid rgba(0,200,240,0.28)', color: 'var(--accent)' }}>
          ✓ SNAPSHOT SAVED
        </div>
      )}

      <BottomBar />
    </div>
  )
}

// ── Multi-view pane cell ──
function DronePane({ drone, focused, onFocus, onUnpin }) {
  const [hovered, setHovered] = useState(false)

  const borderColor = focused ? 'rgba(0,200,240,0.75)'
    : hovered ? 'rgba(0,200,240,0.4)'
    : 'rgba(255,255,255,0.06)'
  const borderWidth = focused ? 3 : hovered ? 2 : 1

  return (
    <div
      onClick={onFocus}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden cursor-pointer group"
      style={{ background: '#000' }}
    >
      <DroneVideo
        streamUrl={drone.stream_url}
        inactive={drone.status === 'inactive'}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Border overlay — sits above video so it's always visible */}
      <div className="absolute inset-0 pointer-events-none z-10"
           style={{
             boxShadow: `inset 0 0 0 ${borderWidth}px ${borderColor}`,
             transition: 'box-shadow 0.15s ease',
           }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-1.5 py-1 pointer-events-none"
           style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.8),transparent)' }}>
        <span className="mono tracking-[1px]"
              style={{ fontSize: 10, color: focused ? 'var(--accent)' : '#dde4ef' }}>
          {drone.id}
        </span>
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[drone.status] }}/>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-1.5 py-1 pointer-events-none"
           style={{ background: 'linear-gradient(0deg,rgba(0,0,0,0.8),transparent)' }}>
        <span className="mono text-[9px] text-[#8aa0b4]">{drone.area.toUpperCase()}</span>
        <span className="mono text-[9px]" style={{
          color: drone.status === 'red'    ? '#6b7b90'
               : drone.battery > 50       ? 'var(--success)'
               : drone.battery > 20       ? 'var(--warning)'
               :                            'var(--danger)',
        }}>
          {drone.status === 'inactive' ? 'STBY' : drone.status === 'red' ? 'N/A' : `${drone.battery}%`}
        </span>
      </div>

      {/* Unpin — visible on hover or when focused */}
      <button
        onClick={e => { e.stopPropagation(); onUnpin() }}
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 flex items-center justify-center rounded-sm transition-opacity opacity-0 group-hover:opacity-100"
        style={{
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#dde4ef',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}

function HudBox({ label, children }) {
  return (
    <div className="px-2 py-1 rounded-sm" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="mono text-[7px] text-[#6b7b90] tracking-[2px] uppercase mb-1">{label}</div>
      {children}
    </div>
  )
}

function MiniMap({ telem, drone }) {
  const baseLat = drone.lat, baseLon = drone.lon
  const cx = telem ? 155 + (telem.lon - baseLon) * 2000 : 155
  const cy = telem ? 88  + (telem.lat - baseLat) * 2000 : 88
  const clampedX = Math.max(15, Math.min(265, cx))
  const clampedY = Math.max(15, Math.min(185, cy))

  return (
    <svg width="100%" height="100%" viewBox="0 0 280 190" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="mm1" cx="45%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="#1e3a10"/>
          <stop offset="100%" stopColor="#0a1608" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="280" height="190" fill="#0c1a0c"/>
      <ellipse cx="125" cy="75" rx="110" ry="85" fill="url(#mm1)" opacity="0.9"/>
      <g stroke="#1e3818" strokeWidth="0.5" fill="none" opacity="0.6">
        <path d="M 10,60 Q 80,40 140,50 Q 200,60 260,45"/>
        <path d="M 10,90 Q 80,70 150,80 Q 210,90 270,75"/>
        <path d="M 10,120 Q 90,100 160,110 Q 230,120 270,105"/>
      </g>
      <path d="M 0,155 Q 80,135 160,115 Q 220,100 280,85"
        stroke="#1a3a5c" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <g stroke="rgba(0,200,240,0.06)" strokeWidth="0.4">
        <line x1="70"  y1="0"   x2="70"  y2="190"/>
        <line x1="140" y1="0"   x2="140" y2="190"/>
        <line x1="210" y1="0"   x2="210" y2="190"/>
        <line x1="0"   y1="63"  x2="280" y2="63"/>
        <line x1="0"   y1="126" x2="280" y2="126"/>
      </g>
      <polyline points={`40,165 60,150 80,135 100,118 120,105 135,96 ${clampedX},${clampedY}`}
        fill="none" stroke="rgba(255,100,100,0.55)" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx={clampedX} cy={clampedY} r="10"
        fill="none" stroke="rgba(0,200,240,0.45)" strokeWidth="1"
        style={{ animation: 'pulseDot 2s ease-out infinite' }}/>
      <circle cx={clampedX} cy={clampedY} r="5"
        fill="rgba(0,200,240,0.2)" stroke="var(--accent)" strokeWidth="1.5"/>
      <circle cx={clampedX} cy={clampedY} r="2.5" fill="var(--accent)"/>
      <polygon points={`${clampedX},${clampedY-12} ${clampedX-4},${clampedY} ${clampedX},${clampedY-4} ${clampedX+4},${clampedY}`}
        fill="var(--accent)" opacity="0.8"/>
      <rect x="8" y="8" width="264" height="174"
        fill="none" stroke="rgba(0,200,240,0.1)" strokeWidth="0.8" strokeDasharray="5 3"/>
    </svg>
  )
}
