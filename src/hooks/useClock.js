// src/hooks/useClock.js
import { useState, useEffect } from 'react'

function padZ(n) { return String(n).padStart(2, '0') }

export function useClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(`${padZ(now.getHours())}:${padZ(now.getMinutes())}:${padZ(now.getSeconds())} WIB`)
      setDate(`${padZ(now.getDate())}/${padZ(now.getMonth() + 1)}/${now.getFullYear()}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return { time, date }
}
