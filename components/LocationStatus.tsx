'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface LocationStatusProps {
  userLocation: { lat: number; lng: number } | null
  locationError: string
  isGettingLocation: boolean
  onGetLocation: () => void
  compact?: boolean
}

export default function LocationStatus({ 
  userLocation, 
  locationError, 
  isGettingLocation, 
  onGetLocation,
  compact = false 
}: LocationStatusProps) {
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${userLocation ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-700">
              {isGettingLocation ? "Getting location..." :
               userLocation ? "Location enabled" :
               locationError ? "Location error" : "Location disabled"}
            </span>
          </div>
          {!userLocation && !isGettingLocation && (
            <button
              onClick={onGetLocation}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded hover:bg-primary-50"
            >
              Enable
            </button>
          )}
        </div>
        {locationError && (
          <p className="text-xs text-red-600 mt-1">{locationError}</p>
        )}
        {userLocation && (
          <p className="text-xs text-green-600 mt-1">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {isGettingLocation ? "Getting your location..." :
             userLocation ? "Location: Enabled" :
             locationError ? "Location: Error" : "Location: Not set"}
          </span>
        </div>
        {!userLocation && !isGettingLocation && (
          <button
            onClick={onGetLocation}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Enable Location
          </button>
        )}
      </div>
      {locationError && (
        <p className="text-xs text-red-600 mt-1">{locationError}</p>
      )}
      {userLocation && (
        <p className="text-xs text-green-600 mt-1">
          Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}
