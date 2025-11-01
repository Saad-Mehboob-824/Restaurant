// components/Map.jsx
'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function Map({ onLocationChange }) {
  const mapRef = useRef(null)
  const onLocationChangeRef = useRef(onLocationChange)

  // keep latest callback without re-running the map init effect
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  useEffect(() => {
    const L = require('leaflet')
    if (!mapRef.current) return

    // Fix Leaflet's default icon URLs so the browser doesn't try to load
    // local files like /marker-icon.png which result in 404s when using
    // Next.js. Point to CDN-hosted images instead.
    try {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    } catch (err) {
      // ignore if merge fails for any reason
      console.warn('Could not set Leaflet icon URLs:', err)
    }

    const DEFAULT_LAT = 33.6518
    const DEFAULT_LNG = 73.0282
    const DEFAULT_ZOOM = 13

    const map = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], { draggable: true }).addTo(map)

    const reverseGeocodeAndNotify = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        const address = data && data.display_name ? data.display_name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        if (onLocationChangeRef.current) onLocationChangeRef.current(address, { lat, lng })
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
        if (onLocationChangeRef.current) onLocationChangeRef.current(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, { lat, lng })
      }
    }

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      reverseGeocodeAndNotify(pos.lat, pos.lng)
    })

    // Try to use the user's current location if permission is granted
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          map.setView([lat, lng], DEFAULT_ZOOM)
          marker.setLatLng([lat, lng])
          reverseGeocodeAndNotify(lat, lng)
        },
        (err) => {
          // User denied or other error: keep default location
          // console.warn('Geolocation error:', err)
        }
      )
    }

    return () => {
      map.remove()
    }
  }, [])

  return <div ref={mapRef} id="map" className="h-[300px] w-full rounded-xl mb-3" />
}