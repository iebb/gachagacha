"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function HomePage() {
  const [barcode, setBarcode] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (barcode.trim()) {
      router.push(`/jan/${barcode.trim()}`);
    }
  };

  const handleScan = (scannedCode: string) => {
    setBarcode(scannedCode);
    router.push(`/jan/${scannedCode}`);
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
              <p>1. Enter a JAN code manually or scan with your camera</p>
              <p>2. View nearby shops and their availability</p>
              <p>3. Get directions and contact information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
