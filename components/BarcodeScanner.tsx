"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X } from "lucide-react";
import { BrowserMultiFormatReader, Result } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startScanner = useCallback(async () => {
    try {
      console.log("Starting scanner...");
      setError("");
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access not supported in this browser");
        return;
      }

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("Camera access granted, setting up video...");
      
      // Store stream reference
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting scanner...");
          
          // Create the code reader instance
          codeReaderRef.current = new BrowserMultiFormatReader();
          
          if (codeReaderRef.current && videoRef.current) {
            codeReaderRef.current.decodeFromVideoDevice(
              null,
              videoRef.current,
              (result: Result | null, error: any) => {
                if (result) {
                  console.log("Barcode detected:", result.getText());
                  onScan(result.getText());
                  stopScanner();
                }
                if (error && error.name !== "NotFoundException") {
                  console.error("Scanning error:", error);
                }
              },
            );
          }
        };

        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setError("Video playback error");
          setIsScanning(false);
        };
      } else {
        console.error("Video element not found");
        setError("Failed to initialize video element");
        stream.getTracks().forEach(track => track.stop());
      }
      
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera access to scan barcodes.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is already in use by another application.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Failed to access camera. Please try again.");
      }
    }
  }, [onScan]);

  const stopScanner = useCallback(() => {
    console.log("Stopping scanner...");
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  }, []);

  const resetError = useCallback(() => {
    setError("");
  }, []);

  return (
    <div className="w-full">
      {error ? (
        <div className="text-center p-4 sm:p-6">
          <div className="text-red-500 mb-4">
            <Camera className="w-12 w-12 sm:w-16 sm:h-16 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={resetError} 
            className="btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      ) : !isScanning ? (
        <div className="text-center p-4 sm:p-6">
          <div className="mb-4">
            <Camera className="w-12 w-12 sm:w-16 sm:h-16 mx-auto mb-2 text-primary-600" />
            <p className="text-sm text-gray-600">Ready to scan JAN codes</p>
          </div>
          <div className="space-y-2">
            <button onClick={startScanner} className="btn-primary w-full">
              Start Camera Scanner
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
        </div>
      )}
    </div>
  );
}
