'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Result, DecodeHintType, BarcodeFormat } from '@zxing/library'

interface BarcodeScannerProps {
  onScan: (code: string) => void
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Start scanner
  const startScanner = useCallback(async () => {
    try {
      setError("")
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      setIsScanning(true)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMsg)
    }
  }, [])

  // Stop scanner
  const stopScanner = useCallback(() => {
    setIsScanning(false)
    cleanup()
  }, [cleanup])

  // Reset error
  const resetError = useCallback(() => {
    setError("")
  }, [])

  // Setup scanner when isScanning becomes true
  useEffect(() => {
    if (isScanning && streamRef.current && videoRef.current) {
      const video = videoRef.current
      const stream = streamRef.current
      
      // Set video source
      video.srcObject = stream
      
      // Wait for video to be ready
      video.onloadedmetadata = () => {
        video.play().then(() => {
          // Create scanner only once
          if (!codeReaderRef.current) {
            codeReaderRef.current = new BrowserMultiFormatReader()
            
            // Configure to support all barcode formats including JAN codes
            const formats = [
              BarcodeFormat.EAN_13,        // JAN codes are EAN-13
              BarcodeFormat.EAN_8,         // EAN-8 codes
              BarcodeFormat.CODE_128,      // Code 128
              BarcodeFormat.CODE_39,       // Code 39
              BarcodeFormat.UPC_A,         // UPC-A
              BarcodeFormat.UPC_E,         // UPC-E
              BarcodeFormat.QR_CODE,       // QR codes
              BarcodeFormat.DATA_MATRIX,   // Data Matrix
              BarcodeFormat.PDF_417,       // PDF 417
              BarcodeFormat.AZTEC          // Aztec
            ]
            
            const hints = new Map()
            hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
            hints.set(DecodeHintType.TRY_HARDER, true)
            hints.set(DecodeHintType.PURE_BARCODE, false)
            
            codeReaderRef.current.setHints(hints)
          }
          
          // Start scanning
          if (codeReaderRef.current) {
            codeReaderRef.current.decodeFromVideoElement(video, (result: Result | undefined, error: any) => {
              if (result) {
                const scannedText = result.getText()
                onScan(scannedText)
                stopScanner()
              }
            })
          }
        }).catch(err => {
          setError('Failed to start video playback')
          setIsScanning(false)
        })
      }
      
      // Handle video errors
      video.onerror = () => {
        setError('Video playback error')
        setIsScanning(false)
      }
    }
  }, [isScanning, onScan, stopScanner])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800 mb-3">{error}</p>
        <button
          onClick={resetError}
          className="btn-secondary text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!isScanning) {
    return (
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
    )
  }

  return (
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

      {/* Instructions */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Position the JAN code within the frame to scan automatically
        </p>
      </div>
    </div>
  )
}
