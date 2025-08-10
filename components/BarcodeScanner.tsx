"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      if (!videoRef.current) return;

      codeReaderRef.current = new BrowserMultiFormatReader();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError("");

        // Start scanning
        if (codeReaderRef.current) {
          codeReaderRef.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result: Result | null, error: any) => {
              if (result) {
                onScan(result.getText());
                stopScanner();
              }
              if (error && error.name !== "NotFoundException") {
                console.error("Scanning error:", error);
              }
            },
          );
        }
      }
    } catch (err) {
      setError(
        "Camera access denied. Please allow camera access to scan barcodes.",
      );
      console.error("Camera error:", err);
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsScanning(false);
    }
  };

  const handleManualInput = () => {
    const barcode = prompt("Enter JAN code manually:");
    if (barcode && barcode.trim()) {
      onScan(barcode.trim());
    }
  };

  return (
    <div className="w-full">
      {error ? (
        <div className="text-center p-4 sm:p-6">
          <div className="text-red-500 mb-4">
            <Camera className="w-12 h-12 sm:w-16 sm:w-16 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={handleManualInput} className="btn-primary w-full">
            Enter JAN Code Manually
          </button>
        </div>
      ) : !isScanning ? (
        <div className="text-center p-4 sm:p-6">
          <div className="mb-4">
            <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 text-primary-600" />
            <p className="text-sm text-gray-600">Ready to scan JAN codes</p>
          </div>
          <div className="space-y-2">
            <button onClick={startScanner} className="btn-primary w-full">
              Start Camera Scanner
            </button>
            <button
              onClick={handleManualInput}
              className="btn-secondary w-full"
            >
              Enter JAN Code Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
            style={{ maxHeight: "250px", minHeight: "200px" }}
          />

          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-primary-500 rounded-lg p-3 sm:p-4 bg-black bg-opacity-20">
              <p className="text-white text-xs sm:text-sm font-medium text-center">
                Point camera at JAN code
              </p>
            </div>
          </div>

          {/* Stop scanning button */}
          <button
            onClick={stopScanner}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            title="Stop scanning"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isScanning && (
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Position the JAN code within the frame to scan automatically
          </p>
          <button onClick={handleManualInput} className="btn-secondary w-full">
            Enter JAN Code Manually
          </button>
        </div>
      )}
    </div>
  );
}
