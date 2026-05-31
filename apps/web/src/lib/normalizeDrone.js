// Maps API drone → UI drone shape. Remove in Phase 3 when real telemetry arrives.
const AREAS = ['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5']

const STATUS_MAP = { active: 'green', offline: 'inactive', maintenance: 'yellow' }

export function normalizeDrone(d) {
  const n       = parseInt(d.code.replace('drone', ''))
  const area    = AREAS[Math.floor((n - 1) / 10)]
  const droneNum = ((n - 1) % 10) + 1
  const status  = STATUS_MAP[d.status] ?? 'inactive'
  const battery = d.battery ?? (status === 'inactive' ? 100 : status === 'green' ? 75 : 20)

  return {
    ...d,
    id:          d.label,           // 'DRN-001' — UI uses this as display ID
    area,
    droneNum,
    status,
    battery,
    serial:      `SN${String(d.id).padStart(8, '0')}`,
    operatorId:  String((d.id * 7919) % 99999),
    type:        'DJI MATRICE 300',
    lat:         d.lat  ?? (-4.2064 + (n * 0.0011) % 0.08),
    lon:         d.lng  ?? (138.350 + (n * 0.0013) % 0.08),
    altitude:    status === 'inactive' ? 0 : 40 + (n % 140),
    speed:       status === 'inactive' ? 0 : 10 + (n % 50),
    heading:     (n * 37) % 360,
    flightSec:   status === 'inactive' ? 0 : 600 + (n * 241) % 13800,
    recording:   false,
    rssi:        status === 'green' ? 4 : status === 'inactive' ? 2 : 1,
    flightStatus: status === 'green'    ? ['PATROL', 'LOITERING', 'EN ROUTE', 'HOVER', 'WAYPOINT'][n % 5]
                : status === 'inactive' ? 'STANDBY'
                : status === 'yellow'   ? 'LOW BATTERY'
                : 'LOST SIGNAL',
  }
}
