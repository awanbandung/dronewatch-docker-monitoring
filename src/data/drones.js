// src/data/drones.js
// Central mock data for all 50 drones.
// In production this will come from the WebSocket/MQTT gateway.

const AREAS  = ['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5']
const TYPES  = ['DJI MATRICE 300', 'DJI MATRICE 350', 'AUTEL EVO II', 'AUTEL EVO MAX']
const STATUS_WEIGHTS = [
  'green','green','green','green','green','green',
  'yellow','yellow','red','inactive',
]

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

export const DRONES = Array.from({ length: 50 }, (_, i) => {
  const areaIdx   = Math.floor(i / 10)
  const droneNum  = (i % 10) + 1
  const area      = AREAS[areaIdx]
  const status    = STATUS_WEIGHTS[rand(0, STATUS_WEIGHTS.length - 1)]
  const battery   =
    status === 'red'      ? 0 :
    status === 'inactive' ? 100 :
    status === 'yellow'   ? rand(5, 24) :
    rand(30, 95)

  return {
    id:        `DRN-${String(i + 1).padStart(3, '0')}`,
    serial:    `SN${rand(10000000, 99999999)}`,
    operatorId: String(rand(10000, 99999)),
    label:     `${area} / Drone ${droneNum}`,
    area,
    droneNum,
    status,   // 'green' | 'yellow' | 'red' | 'inactive'
    battery,
    type:      TYPES[rand(0, TYPES.length - 1)],
    lat:       -4.2064 + (Math.random() - 0.5) * 0.08,
    lon:       138.350 + (Math.random() - 0.5) * 0.08,
    altitude:  status === 'inactive' ? 0 : rand(40, 180),
    speed:     status === 'inactive' ? 0 : rand(0, 60),
    heading:   rand(0, 359),
    flightSec: status === 'inactive' ? 0 : rand(600, 14400),
    recording: status === 'green' && Math.random() > 0.6,
    rssi:      status === 'red' ? 1 : rand(2, 5),
    flightStatus:
      status === 'red'      ? 'LOST SIGNAL' :
      status === 'inactive' ? 'STANDBY' :
      status === 'yellow'   ? 'LOW BATTERY' :
      ['LOITERING', 'EN ROUTE', 'PATROL', 'HOVER', 'WAYPOINT'][rand(0, 4)],
  }
})

export const STATUS_COLORS = {
  green:    'var(--success)',
  yellow:   'var(--warning)',
  red:      'var(--danger)',
  inactive: 'var(--inactive)',
}

export const STATUS_LABELS = {
  green:    'OPERASIONAL',
  yellow:   'LOW BATTERY',
  red:      'LOST SIGNAL',
  inactive: 'STANDBY',
}

export function formatFlightTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export function formatUptime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h} jam ${m} menit` : `${m} menit`
}
