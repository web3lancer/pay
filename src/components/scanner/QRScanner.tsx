'use client'

import { useEffect, useRef, useState } from 'react'
import { FiX, FiUpload, FiZap } from 'react-icons/fi'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
  title?: string
}

export function QRScanner({ isOpen, onClose, onScan, title = "Scan QR Code" }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  // QR Code detection using a simple pattern matching approach
  // In a real app, you'd use a library like jsQR or qr-scanner
  const detectQRCode = (imageData: ImageData): string | null => {
    // This is a simplified detection - in reality you'd use a proper QR library
    // For demo purposes, we'll simulate detection
    return null
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setHasPermission(true)
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setHasPermission(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const qrData = detectQRCode(imageData)
        
        if (qrData) {
          onScan(qrData)
        } else {
          // For demo purposes, simulate a successful scan
          // In reality, this would be detected from the actual QR code
          const mockData = "bitcoin:bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k?amount=0.001&message=Payment"
          onScan(mockData)
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Simulate QR detection for demo purposes
  const simulateQRDetection = () => {
    if (isScanning && Math.random() > 0.95) { // 5% chance per frame
      const mockData = "bitcoin:bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k?amount=0.001&message=Test+Payment"
      onScan(mockData)
    }
  }

  useEffect(() => {
    if (isOpen && !hasPermission) {
      startCamera()
    }
    
    if (!isOpen) {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  // Scanning loop
  useEffect(() => {
    let animationFrame: number
    
    const scanLoop = () => {
      simulateQRDetection()
      if (isScanning) {
        animationFrame = requestAnimationFrame(scanLoop)
      }
    }
    
    if (isScanning) {
      scanLoop()
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isScanning])

  if (!isOpen) return null

  return (
    <>
      <div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Scanner Content */}
          <div className="p-6">
            {error ? (
              <div className="text-center space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null)
                    startCamera()
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : hasPermission ? (
              <div className="space-y-4">
                {/* Camera View */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-48 h-48 border-2 border-primary-500 rounded-lg"
                    >
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500"></div>
                    </div>
                  </div>

                  {/* Scanning Animation */}
                  {isScanning && (
                    <div
                      initial={{ y: -100 }}
                      animate={{ y: 300 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-primary-500 opacity-50"
                    />
                  )}
                </div>

                <p className="text-center text-neutral-600 text-sm">
                  Position the QR code within the frame to scan
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600">Starting camera...</p>
              </div>
            )}

            {/* File Upload Option */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-center text-neutral-600 text-sm mb-4">
                Or upload a QR code image
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center"
              >
                <FiUpload className="mr-2 h-4 w-4" />
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Demo Instructions */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <FiZap className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-blue-800 text-xs">
                  Demo mode: The scanner will automatically detect a sample QR code after a few seconds for testing purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </>
  )
}