// components/Map.jsx
'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function Map({ onLocationChange }) {
  const mapRef = useRef(null)

  useEffect(() => {
    const L = require('leaflet')
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView([40.7128, -74.0060], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    const marker = L.marker([40.7128, -74.0060], { draggable: true }).addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onLocationChange(`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`)
    })

    return () => {
      map.remove()
    }
  }, [onLocationChange])

  return <div ref={mapRef} id="map" className="h-[300px] w-full rounded-xl mb-3" />
}