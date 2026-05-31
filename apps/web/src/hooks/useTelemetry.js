// src/hooks/useTelemetry.js
// Simulates live telemetry updates for a selected drone.
// Phase C: replace setInterval with WebSocket subscription from NestJS gateway.
import { useState, useEffect, useRef } from 'react'

export function useTelemetry(drone) {
  const [telem, setTelem] = useState(() => drone ? {
    lat:     drone.lat,
    lon:     drone.lon,
    alt:     drone.altitude,
    spd:     drone.speed,
    bat:     drone.battery,
    msl:     drone.altitude + 1653,
    hdg:     drone.heading,
    status:  drone.flightStatus,
    rssi:    drone.rssi,
  } : null)

  const ref = useRef(drone)
  ref.current = drone

  useEffect(() => {
    if (!drone) return
    // Reset when drone changes
    setTelem({
      lat:    drone.lat,
      lon:    drone.lon,
      alt:    drone.altitude,
      spd:    drone.speed,
      bat:    drone.battery,
      msl:    drone.altitude + 1653,
      hdg:    drone.heading,
      status: drone.flightStatus,
      rssi:   drone.rssi,
    })

    if (drone.status === 'inactive' || drone.status === 'red') return

    const id = setInterval(() => {
      setTelem(prev => {
        if (!prev) return prev
        const newAlt = Math.max(10, Math.min(200, prev.alt + (Math.random() - 0.48) * 1.2))
        const newSpd = Math.max(0,  Math.min(80,  prev.spd + (Math.random() - 0.5)  * 2))
        const newBat = Math.max(0,  prev.bat - Math.random() * 0.015)
        const newHdg = ((prev.hdg + (Math.random() - 0.5) * 2) + 360) % 360
        return {
          ...prev,
          alt: newAlt,
          spd: newSpd,
          bat: newBat,
          msl: newAlt + 1653 + (Math.random() - 0.5) * 2,
          hdg: newHdg,
          lat: prev.lat + (Math.random() - 0.5) * 0.00008,
          lon: prev.lon + (Math.random() - 0.5) * 0.00008,
        }
      })
    }, 300)

    return () => clearInterval(id)
  }, [drone?.id])

  return telem
}
