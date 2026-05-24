// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/hooks/useClock.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { time, date } = useClock()

  const [division, setDivision]   = useState('')
  const [access, setAccess]       = useState('')
  const [opId, setOpId]           = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [remember, setRemember]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [attempts, setAttempts]   = useState(0)
  const [error, setError]         = useState('')

  const idValid   = /^OPS-[A-Z0-9]{6,8}$/.test(opId)
  const passStrength = password.length === 0 ? null
                     : password.length < 6   ? 'WEAK'
                     : password.length < 10  ? 'MODERATE'
                     : 'STRONG'
  const strengthColor = { WEAK: 'var(--danger)', MODERATE: 'var(--warning)', STRONG: 'var(--success)' }

  function handleIdInput(e) {
    setOpId(e.target.value.toUpperCase())
  }

  function handleLogin() {
    if (!opId || !password) return
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
      // In production: validate against backend, store JWT
      if (opId === 'OPS-ADMIN1' && password === 'admin') {
        navigate('/dashboard')
      } else {
        const next = attempts + 1
        setAttempts(next)
        setError(`AUTHENTICATION FAILED — Invalid credentials. Attempt ${next} logged. ${Math.max(0, 5 - next)} retries remaining.`)
      }
    }, 1800)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
         style={{ background: '#0b0e14' }}>

      {/* Grid bg */}
      <div className="fixed inset-0 z-0 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(0,200,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,240,0.03) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }} />
      <div className="fixed inset-0 z-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(11,14,20,0.9) 100%)' }} />

      {/* Corner brackets */}
      {['tl','tr','bl','br'].map(pos => (
        <div key={pos} className="fixed z-10 w-14 h-14 pointer-events-none" style={{
          top:    pos.startsWith('t') ? 20 : undefined,
          bottom: pos.startsWith('b') ? 20 : undefined,
          left:   pos.endsWith('l')   ? 20 : undefined,
          right:  pos.endsWith('r')   ? 20 : undefined,
          borderTop:    pos.startsWith('t') ? '1px solid rgba(0,200,240,0.5)' : undefined,
          borderBottom: pos.startsWith('b') ? '1px solid rgba(0,200,240,0.5)' : undefined,
          borderLeft:   pos.endsWith('l')   ? '1px solid rgba(0,200,240,0.5)' : undefined,
          borderRight:  pos.endsWith('r')   ? '1px solid rgba(0,200,240,0.5)' : undefined,
          opacity: 0.6,
        }} />
      ))}

      {/* Top status bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6"
           style={{ height: 36, background: 'rgba(10,13,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-6 mono text-[10px] text-[#6b7b90]">
          <span className="hd font-semibold text-[11px] tracking-[3px]"
                style={{ color: 'var(--danger)' }}>▶ CLASSIFIED SYSTEM</span>
          <span><span className="status-dot dot-green" />SERVER ONLINE</span>
          <span><span className="status-dot dot-green" />ENCRYPTION ACTIVE</span>
          <span><span className="status-dot dot-yellow"/>DRONE FLEET: STANDBY</span>
        </div>
        <div className="flex items-center gap-6 mono text-[10px] text-[#6b7b90]">
          <span>NODE: OVH-BM-JKT-01</span>
          <span>LAT: -6.2088 / LON: 106.8456</span>
          <span style={{ color: 'var(--accent)' }}>{time}</span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 mono text-[9px] text-[#6b7b90]"
           style={{ height: 28, background: 'rgba(10,13,20,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span>DRONEWATCH COMMAND PLATFORM · UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED · ALL SESSIONS ARE MONITORED</span>
        <span>SESSION: AWAITING AUTH — {date} {time}</span>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[460px] mx-4"
           style={{ animation: 'fadeUp 0.7s ease forwards' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <ShieldLogo />
          <div className="hd font-bold text-[34px] tracking-[6px] uppercase text-[#dde4ef] leading-none mb-1">
            DroneWatch
          </div>
          <div className="mono text-[10px] tracking-[3px] uppercase" style={{ color: 'var(--accent)' }}>
            Fleet Command Platform
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="mono text-[9px] text-[#6b7b90] tracking-[2px] whitespace-nowrap">
              OPERATOR AUTHENTICATION REQUIRED
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-sm px-7 py-6"
             style={{ background: '#141922', border: '1px solid rgba(0,200,240,0.2)' }}>
          {/* Top accent line */}
          <div className="absolute top-[-1px] left-5 right-5 h-[2px]"
               style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <span className="mono text-[13px] text-[#6b7b90] tracking-[3px] uppercase">Secure Access Portal</span>
            <span className="mono text-[9px] px-2 py-0.5 rounded-sm tracking-[1px]"
                  style={{ border: '1px solid rgba(0,200,240,0.3)', color: 'var(--accent)' }}>
              AES-256 · TLS 1.3
            </span>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-2.5 px-3 py-2 mb-4 rounded-sm"
                 style={{ background: 'rgba(255,64,64,0.06)', border: '1px solid rgba(255,64,64,0.25)' }}>
              <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 1 }}>⚠</span>
              <span className="mono text-[10px] leading-snug" style={{ color: 'rgba(255,110,110,0.95)' }}>
                {error}
              </span>
            </div>
          )}

          {/* Division + Access row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label="Division">
              <select className="field-select" value={division} onChange={e => setDivision(e.target.value)}>
                <option value="">— SELECT —</option>
                <option>AIR UNIT ALPHA</option>
                <option>AIR UNIT BRAVO</option>
                <option>AIR UNIT CHARLIE</option>
                <option>INTEL OPS</option>
                <option>COMMAND HQ</option>
              </select>
            </Field>
            <Field label="Access Level">
              <select className="field-select" value={access} onChange={e => setAccess(e.target.value)}>
                <option value="">— SELECT —</option>
                <option>OPERATOR</option>
                <option>SUPERVISOR</option>
                <option>COMMANDER</option>
                <option>ADMIN</option>
              </select>
            </Field>
          </div>

          {/* Operator ID */}
          <Field label="Operator ID"
                 hint={opId ? (idValid ? '✓ VALID FORMAT' : 'FORMAT: OPS-XXXXXXXX') : ''}
                 hintColor={opId ? (idValid ? 'var(--success)' : 'var(--warning)') : ''}>
            <input className="field-input" type="text"
                   value={opId} onChange={handleIdInput} onKeyDown={handleKeyDown}
                   placeholder="OPS-XXXXXXXX" autoComplete="off" spellCheck={false} />
          </Field>

          {/* Password */}
          <Field label="Password"
                 hint={passStrength}
                 hintColor={passStrength ? strengthColor[passStrength] : ''}>
            <div className="relative">
              <input className="field-input pr-14"
                     type={showPass ? 'text' : 'password'}
                     value={password} onChange={e => setPassword(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="••••••••••••" />
              <button type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[9px] tracking-[1px]"
                      style={{ color: '#6b7b90' }}>
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </Field>

          {/* Options row */}
          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 cursor-pointer select-none mono text-[10px] text-[#6b7b90]"
                   onClick={() => setRemember(v => !v)}>
              <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
                   style={{
                     background: remember ? 'var(--accent-dim)' : '#0d1018',
                     border: `1px solid ${remember ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
                   }}>
                {remember && <span style={{ fontSize: 9, color: 'var(--accent)' }}>✓</span>}
              </div>
              REMEMBER THIS TERMINAL
            </label>
            <button className="mono text-[9px] text-[#6b7b90] tracking-[1px] hover:text-[var(--accent)] transition-colors"
                    style={{ borderBottom: '1px solid transparent' }}>
              FORGOT CREDENTIALS
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[46px] rounded-sm hd font-semibold text-[15px] tracking-[5px] uppercase transition-all duration-200 relative overflow-hidden"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,200,240,0.35)',
              color: 'var(--accent)',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? '◌  AUTHENTICATING...' : '▶  AUTHENTICATE'}
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3"
               style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="mono text-[9px] text-[#6b7b90]">LAST LOGIN: NO RECORD ON FILE</span>
            <span className="mono text-[9px]" style={{ color: 'var(--accent)' }}>v2.4.1-RELEASE</span>
          </div>

          {/* Demo hint */}
          <div className="mt-3 text-center mono text-[9px] text-[#4a5568]">
            DEMO: OPS-ADMIN1 / admin
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .field-input {
          width: 100%; height: 42px;
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 2px;
          color: #dde4ef;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          padding: 0 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: rgba(0,200,240,0.35);
          box-shadow: 0 0 0 1px rgba(0,200,240,0.18);
        }
        .field-input::placeholder { color: rgba(120,140,160,0.35); font-size: 11px; }
        .field-select {
          width: 100%; height: 42px;
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 2px;
          color: #6b7b90;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          padding: 0 12px;
          outline: none;
          appearance: none;
          cursor: pointer;
        }
        .field-select:focus { border-color: rgba(0,200,240,0.35); }
      `}</style>
    </div>
  )
}

function Field({ label, hint, hintColor, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="mono text-[9px] text-[#6b7b90] tracking-[2px] uppercase">{label}</span>
        {hint && <span className="mono text-[9px] tracking-[1px]" style={{ color: hintColor }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ShieldLogo() {
  return (
    <div className="w-[72px] h-[72px] mx-auto mb-4">
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 5 L64 16 L64 38 C64 54 51 64 36 68 C21 64 8 54 8 38 L8 16 Z"
          fill="rgba(0,200,240,0.05)" stroke="rgba(0,200,240,0.45)" strokeWidth="1"/>
        <path d="M36 14 L56 23 L56 39 C56 50 47 58 36 62 C25 58 16 50 16 39 L16 23 Z"
          fill="rgba(0,200,240,0.04)" stroke="rgba(0,200,240,0.18)" strokeWidth="0.5"/>
        <rect x="31" y="31" width="10" height="10" rx="1.5" fill="rgba(0,200,240,0.85)"/>
        <rect x="20" y="33.5" width="11" height="3" rx="1" fill="rgba(0,200,240,0.6)"/>
        <rect x="41" y="33.5" width="11" height="3" rx="1" fill="rgba(0,200,240,0.6)"/>
        <ellipse cx="20" cy="28" rx="6" ry="2.2" stroke="rgba(0,200,240,0.7)" strokeWidth="0.8" fill="none"/>
        <ellipse cx="52" cy="28" rx="6" ry="2.2" stroke="rgba(0,200,240,0.7)" strokeWidth="0.8" fill="none"/>
        <ellipse cx="20" cy="44" rx="6" ry="2.2" stroke="rgba(0,200,240,0.7)" strokeWidth="0.8" fill="none"/>
        <ellipse cx="52" cy="44" rx="6" ry="2.2" stroke="rgba(0,200,240,0.7)" strokeWidth="0.8" fill="none"/>
        <circle cx="20" cy="28" r="2" fill="rgba(0,200,240,1)"/>
        <circle cx="52" cy="28" r="2" fill="rgba(0,200,240,1)"/>
        <circle cx="20" cy="44" r="2" fill="rgba(0,200,240,1)"/>
        <circle cx="52" cy="44" r="2" fill="rgba(0,200,240,1)"/>
      </svg>
    </div>
  )
}
