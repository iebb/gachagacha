"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BarcodeScanner from "../../../components/BarcodeScanner";
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

  const handleScan = (scannedCode: string) => {
    setBarcode(scannedCode);
    searchShops(scannedCode);
  };

  const handleManualSearch = () => {
    if (barcode.trim()) {
      searchShops(barcode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
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
                  onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={13}
                />
                <button
                  onClick={handleManualSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Scanner */}
            <div className="mt-4">
              <BarcodeScanner onScan={handleScan} />
            </div>
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
