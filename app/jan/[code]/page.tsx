"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ShopList from "../../../components/ShopList";
import LocationStatus from "../../../components/LocationStatus";

interface Shop {
  _id: string;
  sort: [string, number];
  _source: {
    name: string;
    address1: string;
    tel: string;
    operating_hours: string;
    access: string;
    thumb: string;
    maker: string;
    etc1: string;
  };
}

export default function JanCodePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [barcode, setBarcode] = useState<string>("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user location on component mount if not provided in URL
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      getUserLocation();
    }
  }, [searchParams]);

  useEffect(() => {
    if (params.code && typeof params.code === "string") {
      setBarcode(params.code);
      // Only search when we have location (either from URL or obtained)
      if (userLocation !== null) {
        searchShops(params.code);
      }
    }
  }, [params.code, userLocation]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      // Use URL parameters as fallback if available
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      if (lat && lng) {
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
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
        
        // Use URL parameters as fallback if available
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        if (lat && lng) {
          setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const searchShops = async (code: string) => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError("");

    // Use location from state (either from URL or obtained automatically)
    let apiUrl = `/api/search-shops?barcode=${encodeURIComponent(code.trim())}`;
    if (userLocation) {
      apiUrl += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
    }
    
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to search shops");
      }

      const data = await response.json();

      // Handle the actual API response structure
      if (data.hits && data.hits.hits) {
        setShops(data.hits.hits);
      } else if (data.shops) {
        setShops(data.shops);
      } else {
        setShops([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setShops([]);
    } finally {
      setIsLoading(false);
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
            JAN Code: <span className="font-mono font-semibold text-primary-600">{barcode}</span>
          </p>
        </div>

        {/* Location Status */}
        <div className="max-w-2xl mx-auto mb-4">
          <LocationStatus
            userLocation={userLocation}
            locationError={locationError}
            isGettingLocation={isGettingLocation}
            onGetLocation={getUserLocation}
            compact={true}
          />
        </div>

        {/* Results */}
        {isGettingLocation && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Getting your location...</p>
          </div>
        )}

        {!isGettingLocation && isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Searching for shops...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && shops.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Found {shops.length} shop{shops.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <ShopList shops={shops} currentBarcode={barcode} />
          </div>
        )}

        {!isGettingLocation && !isLoading && !error && shops.length === 0 && barcode && userLocation === null && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-gray-600">Waiting for location to search for shops...</p>
          </div>
        )}

        {!isGettingLocation && !isLoading && !error && shops.length === 0 && barcode && userLocation !== null && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-gray-600">No shops found for this JAN code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
