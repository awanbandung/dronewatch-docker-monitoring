// src/pages/DashboardPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav    from '@/components/layout/TopNav.jsx'
import BottomBar from '@/components/layout/BottomBar.jsx'
import DroneThumb from '@/components/stream/DroneThumb.jsx'
import { STATUS_COLORS } from '@/data/drones.js'
import { useClock } from '@/hooks/useClock.js'
import { useDrones } from '@/hooks/useDrones.js'

// ── KPI data (replace with WebSocket in Phase C)
const KPIS = [
  { id: 'alerts',  label: 'GPS Alert Active',         value: '32',  color: 'var(--danger)',  delta: '▲ +4' },
  { id: 'status',  label: 'Drone Status Yellow / Red', value: '12',  color: 'var(--warning)', delta: '▲ +2' },
  { id: 'ready',   label: 'Asset Readiness',           value: '95%', color: 'var(--success)', delta: '▼ -1%' },
  { id: 'active',  label: 'Drones Active',             value: '47',  color: 'var(--accent)',  delta: '/ 50 TOTAL' },
]

const GPS_UNITS = [
  { id: 'GPS-001', loc: '-6.208° / 106.845°', status: 'green'    },
  { id: 'GPS-002', loc: '-6.214° / 106.851°', status: 'green'    },
  { id: 'GPS-007', loc: '-6.198° / 106.838°', status: 'yellow'   },
  { id: 'GPS-012', loc: '-6.221° / 106.862°', status: 'inactive' },
]

const INVENTORY = [
  { name: 'STARLINK',     count: '12 UNIT', badge: '15% REPAIR', type: 'warn' },
  { name: 'DJI MATRICE',  count: '30 UNIT', badge: 'READY',      type: 'ok'   },
  { name: 'AUTEL EVO',    count: '20 UNIT', badge: 'READY',      type: 'ok'   },
  { name: 'BATTERY PACK', count: '148 UNIT',badge: 'LOW STOCK',  type: 'warn' },
  { name: 'RTK MODULE',   count: '8 UNIT',  badge: '3 OFFLINE',  type: 'bad'  },
]

const ALERTS = [
  { time: '10:32:41', msg: 'LOST SIGNAL — drone tidak merespons',           drone: 'E02 · AREA 3 / DRONE 2', level: 'crit' },
  { time: '10:31:08', msg: 'BATTERY CRITICAL — 8% remaining',               drone: 'D02 · AREA 2 / DRONE 3', level: 'crit' },
  { time: '10:28:55', msg: 'LOW BATTERY — 22% remaining, RTH advised',      drone: 'D03 · AREA 2 / DRONE 4', level: 'warn' },
  { time: '10:25:12', msg: 'GEOFENCE WARNING — approaching boundary',        drone: 'B03 · AREA 1 / DRONE 5', level: 'warn' },
  { time: '10:22:30', msg: 'DRONE DEPLOYED — mission started',               drone: 'C03 · AREA 3 / DRONE 1', level: 'info' },
]

const BADGE_STYLES = {
  ok:   { background: 'rgba(0,230,118,0.1)',  color: 'var(--success)', border: '1px solid rgba(0,230,118,0.25)' },
  warn: { background: 'rgba(240,165,0,0.1)',  color: 'var(--warning)', border: '1px solid rgba(240,165,0,0.25)' },
  bad:  { background: 'rgba(255,64,64,0.1)',  color: 'var(--danger)',  border: '1px solid rgba(255,64,64,0.25)' },
}

const ALERT_BORDER = { crit: 'var(--danger)', warn: 'var(--warning)', info: 'var(--accent)' }

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeMapMode, setActiveMapMode] = useState('SAT')
  const { drones } = useDrones()
  const previewDrones = drones.slice(0, 4)

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0b0e14' }}>
      <TopNav />

      {/* KPI Strip */}
      <div className="fixed left-0 right-0 flex items-stretch"
           style={{ top: 42, height: 64, background: '#0f1319', borderBottom: '1px solid rgba(255,255,255,0.10)', zIndex: 40 }}>
        {KPIS.map((kpi, i) => (
          <div key={kpi.id}
               className="flex-1 flex flex-col justify-center px-5 relative hover:bg-white/[0.02] transition-colors"
               style={{ borderRight: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
            <div className="hd font-bold text-[30px] leading-none tracking-[1px]" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
            <div className="mono text-[9px] text-[#6b7b90] tracking-[2px] uppercase mt-1">{kpi.label}</div>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 mono text-[9px]" style={{ color: kpi.color }}>
              {kpi.delta}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                 style={{ background: `linear-gradient(90deg, ${kpi.color.replace(')', ',0.4)')}, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="fixed left-0 right-0 flex" style={{ top: 106, bottom: 28 }}>

        {/* Operation Map */}
        <div className="flex-1 relative overflow-hidden" style={{ background: '#0a1420', borderRight: '1px solid rgba(255,255,255,0.10)' }}>
          <div className="absolute top-3 left-3 z-10 mono text-[9px] text-[#6b7b90] tracking-[2px] px-2 py-1 rounded-sm"
               style={{ background: 'rgba(11,14,20,0.8)', border: '1px solid rgba(255,255,255,0.10)' }}>
            ⊕ PETA OPERASI UTAMA — REAL-TIME
          </div>
          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
            {['SAT','TOPO','HEAT','TRAIL'].map(mode => (
              <button key={mode}
                      onClick={() => setActiveMapMode(mode)}
                      className="mono text-[9px] px-2 py-1 rounded-sm transition-colors"
                      style={{
                        background: 'rgba(11,14,20,0.85)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        color: activeMapMode === mode ? 'var(--accent)' : '#6b7b90',
                        borderColor: activeMapMode === mode ? 'rgba(0,200,240,0.28)' : undefined,
                      }}>
                {mode}
              </button>
            ))}
          </div>

          {/* SVG Map */}
          <svg width="100%" height="100%" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="tB" cx="50%" cy="50%" r="60%">
                <stop offset="0%"   stopColor="#1a2e1a"/>
                <stop offset="60%"  stopColor="#0f1f12"/>
                <stop offset="100%" stopColor="#0a1408"/>
              </radialGradient>
              <radialGradient id="h1" cx="40%" cy="35%" r="50%">
                <stop offset="0%"   stopColor="#2d4a1e"/>
                <stop offset="100%" stopColor="#1a2e14" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="h2" cx="65%" cy="60%" r="45%">
                <stop offset="0%"   stopColor="#243d1a"/>
                <stop offset="100%" stopColor="#1a2e14" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="900" height="520" fill="url(#tB)"/>
            <ellipse cx="360" cy="180" rx="280" ry="190" fill="url(#h1)" opacity="0.9"/>
            <ellipse cx="580" cy="310" rx="240" ry="180" fill="url(#h2)" opacity="0.8"/>
            <g stroke="#2a4820" strokeWidth="0.6" fill="none" opacity="0.5">
              <path d="M 80,200 Q 200,140 340,120 Q 480,100 560,160 Q 640,220 700,200"/>
              <path d="M 60,260 Q 180,200 320,180 Q 460,160 560,220 Q 660,280 740,260"/>
              <path d="M 40,320 Q 160,260 300,240 Q 440,220 560,280 Q 680,340 780,320"/>
              <path d="M 50,380 Q 200,320 380,300 Q 520,280 640,340 Q 760,400 840,380"/>
            </g>
            <g opacity="0.4">
              {[[150,200,40],[300,160,50],[500,250,45],[580,350,55],[680,280,40],[750,420,50]].map(([cx,cy,r],i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="#1e3d14"/>
              ))}
            </g>
            <path d="M 0,440 Q 200,380 420,300 Q 540,260 620,240 Q 720,220 900,190"
              stroke="#1a3a5c" strokeWidth="3" fill="none" opacity="0.6"/>
            <g stroke="rgba(0,200,240,0.05)" strokeWidth="0.5">
              {[150,300,450,600,750].map(x => <line key={x} x1={x} y1="0" x2={x} y2="520"/>)}
              {[130,260,390].map(y => <line key={y} x1="0" y1={y} x2="900" y2={y}/>)}
            </g>
            {/* Drone pins */}
            {[
              [180,160,'A01','green'],[280,210,'A02','green'],[420,180,'A03','green'],
              [560,220,'B01','green'],[650,300,'B02','green'],[750,250,'B03','green'],
              [820,380,'C01','green'],[140,330,'C02','green'],[350,360,'C03','green'],
              [500,390,'D01','green'],[340,280,'D02','yellow'],[480,310,'D03','yellow'],
              [700,430,'E01','yellow'],[220,430,'E02','red'],[600,460,'E03','red'],
            ].map(([cx,cy,label,status]) => (
              <g key={label}>
                <circle cx={cx} cy={cy} r="6"
                  fill={`${STATUS_COLORS[status]}22`}
                  stroke={STATUS_COLORS[status]} strokeWidth="1.5"/>
                <circle cx={cx} cy={cy} r="2.5" fill={STATUS_COLORS[status]}/>
                <text x={cx+8} y={cy-2} fontFamily="Share Tech Mono,monospace" fontSize="8"
                  fill={STATUS_COLORS[status]} opacity="0.9">{label}</text>
              </g>
            ))}
            <polygon points="100,120 800,100 860,450 100,460 60,280"
              fill="none" stroke="rgba(0,200,240,0.12)" strokeWidth="1" strokeDasharray="8 4"/>
            <text x="104" y="116" fontFamily="Share Tech Mono,monospace" fontSize="9"
              fill="rgba(0,200,240,0.5)" letterSpacing="1">ZONA OPERASI ALPHA</text>
            <g transform="translate(840,470)">
              <circle r="18" fill="rgba(11,14,20,0.8)" stroke="rgba(0,200,240,0.2)" strokeWidth="0.8"/>
              <text y="-6" textAnchor="middle" fontFamily="Share Tech Mono,monospace" fontSize="8" fill="rgba(0,200,240,0.8)">N</text>
              <polygon points="0,-14 -3,0 0,-4 3,0" fill="rgba(0,200,240,0.8)"/>
            </g>
          </svg>

          {/* Map HUD */}
          <div className="absolute bottom-3 left-3 flex gap-3 z-10">
            {[['green','OPERASIONAL (47)'],['warning','LOW BAT (3)'],['danger','LOST SIGNAL (2)'],['inactive','STANDBY (5)']].map(([c,lbl]) => (
              <div key={lbl} className="flex items-center gap-1.5 mono text-[9px] text-[#6b7b90] px-2 py-1 rounded-sm"
                   style={{ background: 'rgba(11,14,20,0.85)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--${c})` }}/>
                {lbl}
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 mono text-[9px] text-[#6b7b90] px-2 py-1 rounded-sm z-10"
               style={{ background: 'rgba(11,14,20,0.85)', border: '1px solid rgba(255,255,255,0.09)' }}>
            SCALE: 1 : 25,000 · WGS84
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] shrink-0 flex flex-col overflow-y-auto overflow-x-hidden" style={{ background: '#0f1319' }}>

          {/* Streaming thumbnails */}
          <SectionHeader title="LIVE STREAMING" dotColor="var(--accent)"
                         action="OPEN ▶" onAction={() => navigate('/streaming')} />
          <div className="grid grid-cols-2 gap-1 p-2" style={{ background: '#0f1319', flexShrink: 0 }}>
            {previewDrones.map(d => (
              <DroneThumb key={d.id} drone={d} width={144} height={90}
                          onClick={() => navigate('/streaming')} />
            ))}
          </div>
          <Divider />

          {/* GPS Tracker */}
          <SectionHeader title="GPS TRACKER" dotColor="var(--success)" action="DETAIL ▶" />
          <div className="px-3 py-2.5 flex-shrink-0">
            <div className="h-2.5 rounded-sm overflow-hidden flex mb-2"
                 style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ width: '72%', background: 'var(--success)' }}/>
              <div style={{ width: '18%', background: 'var(--warning)' }}/>
              <div style={{ width: '10%', background: 'var(--danger)' }}/>
            </div>
            <div className="flex gap-3 flex-wrap mb-2.5">
              {[['success','Operasional (36)'],['warning','En Route (9)'],['danger','Tidak Aktif (5)']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1 mono text-[9px] text-[#6b7b90]">
                  <div className="w-2 h-2 rounded-sm" style={{ background: `var(--${c})` }}/>
                  {l}
                </div>
              ))}
            </div>
            {GPS_UNITS.map(u => (
              <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 mb-1 rounded-sm"
                   style={{ background: '#131820', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="mono text-[9px] text-[#8aa0b4] tracking-wide flex-1">{u.id}</span>
                <span className="mono text-[8px] text-[#6b7b90] flex-[2]">{u.loc}</span>
                <StatusPill status={u.status}/>
              </div>
            ))}
          </div>
          <Divider />

          {/* Inventory */}
          <SectionHeader title="INVENTORY ASSET" dotColor="var(--warning)" action="DETAIL ▶" />
          <div className="px-3 py-2 flex-shrink-0">
            {INVENTORY.map(item => (
              <div key={item.name} className="flex items-center gap-2 px-2 py-1.5 mb-1 rounded-sm cursor-pointer transition-colors hover:bg-white/[0.02]"
                   style={{ background: '#131820', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="hd font-semibold text-xs text-[#dde4ef] tracking-wide flex-1">{item.name}</span>
                <span className="mono text-[9px] text-[#6b7b90]">{item.count}</span>
                <span className="mono text-[8px] px-1.5 py-0.5 rounded-sm" style={BADGE_STYLES[item.type]}>{item.badge}</span>
              </div>
            ))}
          </div>
          <Divider />

          {/* Active Alerts */}
          <SectionHeader title="ACTIVE ALERTS"
                         dotColor="var(--danger)"
                         dotPulse="0.8s"
                         action="CLEAR ALL" />
          <div className="px-3 py-2 flex-1">
            {ALERTS.map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 mb-1 rounded-sm"
                   style={{
                     background: '#131820',
                     borderLeft: `2px solid ${ALERT_BORDER[a.level]}`,
                     borderTop: '1px solid rgba(255,255,255,0.06)',
                     borderRight: '1px solid rgba(255,255,255,0.06)',
                     borderBottom: '1px solid rgba(255,255,255,0.06)',
                   }}>
                <span className="mono text-[8px] text-[#6b7b90] whitespace-nowrap shrink-0 mt-0.5">{a.time}</span>
                <div>
                  <div className="mono text-[9px] text-[#8aa0b4] leading-snug">{a.msg}</div>
                  <div className="mono text-[8px] text-[#6b7b90] mt-0.5">{a.drone}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <BottomBar />
    </div>
  )
}

function SectionHeader({ title, dotColor, dotPulse, action, onAction }) {
  return (
    <div className="sec-hd flex-shrink-0">
      <div className="sec-title">
        <div className="sec-dot" style={{ background: dotColor, animationDuration: dotPulse }}/>
        {title}
      </div>
      {action && (
        <button onClick={onAction}
                className="mono text-[8px] px-1.5 py-0.5 rounded-sm transition-colors hover:bg-accent/10"
                style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'var(--accent)', letterSpacing: '1px' }}>
          {action}
        </button>
      )}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', flexShrink: 0 }}/>
}

function StatusPill({ status }) {
  const styles = {
    green:    { bg: 'rgba(0,230,118,0.1)',  color: 'var(--success)', border: '1px solid rgba(0,230,118,0.25)', label: 'AKTIF'    },
    yellow:   { bg: 'rgba(240,165,0,0.1)',  color: 'var(--warning)', border: '1px solid rgba(240,165,0,0.25)', label: 'EN ROUTE' },
    inactive: { bg: 'rgba(255,64,64,0.1)',  color: 'var(--danger)',  border: '1px solid rgba(255,64,64,0.25)', label: 'OFFLINE'  },
  }
  const s = styles[status] || styles.inactive
  return (
    <span className="mono text-[8px] px-1.5 py-0.5 rounded-sm shrink-0"
          style={{ background: s.bg, color: s.color, border: s.border, letterSpacing: '1px' }}>
      {s.label}
    </span>
  )
}
