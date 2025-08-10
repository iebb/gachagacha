"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ShopList from "../../../components/ShopList";

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
  const [barcode, setBarcode] = useState<string>("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (params.code && typeof params.code === "string") {
      setBarcode(params.code);
      searchShops(params.code);
    }
  }, [params.code]);

  const searchShops = async (code: string) => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search-shops?barcode=${encodeURIComponent(code.trim())}`,
      );

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
        {/* JAN Code Display */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              JAN Code
            </h2>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-primary-600">
              {barcode}
            </p>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
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

        {!isLoading && !error && shops.length === 0 && barcode && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-gray-600">No shops found for this JAN code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
