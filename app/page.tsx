"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function HomePage() {
  const [barcode, setBarcode] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const router = useRouter();

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        console.log("Location obtained:", { lat: latitude, lng: longitude });
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred getting location.");
            break;
        }
        console.error("Location error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSearch = () => {
    if (barcode.trim()) {
      // Include location in the URL if available
      if (userLocation) {
        router.push(`/jan/${barcode.trim()}?lat=${userLocation.lat}&lng=${userLocation.lng}`);
      } else {
        router.push(`/jan/${barcode.trim()}`);
      }
    }
  };

  const handleScan = (scannedCode: string) => {
    setBarcode(scannedCode);
    // Include location in the URL if available
    if (userLocation) {
      router.push(`/jan/${scannedCode}?lat=${userLocation.lat}&lng=${userLocation.lng}`);
    } else {
      router.push(`/jan/${scannedCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Gacha Shop Finder
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Scan a JAN barcode to find the nearest shops offering your favorite
            gacha items
          </p>
        </div>

        {/* Location Status */}
        <div className="max-w-2xl mx-auto mb-4">
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
                  onClick={getUserLocation}
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
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex-1">
              <label
                htmlFor="barcode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                JAN Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="4582769..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={13}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Scanner */}
            <div className="mt-4">
              <BarcodeScanner onScan={handleScan} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              How to Use
            </h2>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p>1. Enable location access to find nearby shops</p>
              <p>2. Enter a JAN code or scan with your camera</p>
              <p>3. View nearby shops and their availability</p>
              <p>4. Get directions and contact information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
