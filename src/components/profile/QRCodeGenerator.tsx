'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCopy, FiCheck, FiDownload, FiShare2 } from 'react-icons/fi'
import QRCode from 'react-qr-code'

interface QRCodeGeneratorProps {
  username: string
  displayName: string
  walletAddress?: string
  amount?: string
  message?: string
  type?: 'profile' | 'payment'
}

export function QRCodeGenerator({ 
  username, 
  displayName, 
  walletAddress, 
  amount, 
  message, 
  type = 'profile' 
}: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png')

  // Generate QR data based on type
  const generateQRData = () => {
    if (type === 'payment' && walletAddress) {
      let qrData = `bitcoin:${walletAddress}`
      const params = new URLSearchParams()
      
      if (amount) params.set('amount', amount)
      if (message) params.set('message', message)
      
      if (params.toString()) {
        qrData += `?${params.toString()}`
      }
      
      return qrData
    }
    
    // Profile type
    return `https://pay.web3lancer.website/pay/${username}`
  }

  const qrData = generateQRData()
  const shareUrl = type === 'profile' ? qrData : `Pay ${displayName}: ${qrData}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (downloadFormat === 'svg') {
      downloadSVG()
    } else {
      downloadPNG()
    }
  }

  const downloadSVG = () => {
    const svg = document.querySelector('#qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${username}-qr-${type}.svg`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 400
    canvas.width = size
    canvas.height = size

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Create QR code on canvas (simplified - in real app use QRCode library)
    const qrCodeElement = document.querySelector('#qr-code-svg')
    if (qrCodeElement) {
      const svgData = new XMLSerializer().serializeToString(qrCodeElement)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size)
        
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${username}-qr-${type}.png`
          link.click()
          URL.revokeObjectURL(url)
        })
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Payment ${type === 'profile' ? 'Profile' : 'Request'}`,
          text: shareUrl,
          url: type === 'profile' ? qrData : undefined
        })
      } catch (err) {
        // Fallback to copy
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
    >
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">
          {type === 'profile' ? 'Payment Profile QR' : 'Payment Request QR'}
        </h3>
        
        {/* QR Code */}
        <div className="bg-white p-6 rounded-lg border-2 border-neutral-100 mx-auto w-fit">
          <QRCode
            id="qr-code-svg"
            value={qrData}
            size={200}
          />
        </div>

        {/* QR Data Display */}
        <div className="bg-neutral-50 rounded-lg p-4 text-left">
          <p className="text-xs text-neutral-500 mb-1">
            {type === 'profile' ? 'Profile URL:' : 'Payment Data:'}
          </p>
          <p className="text-sm font-mono text-neutral-900 break-all">
            {qrData}
          </p>
        </div>

        {/* Download Format Selection */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setDownloadFormat('png')}
            className={`px-3 py-1 text-xs rounded ${
              downloadFormat === 'png'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            PNG
          </button>
          <button
            onClick={() => setDownloadFormat('svg')}
            className={`px-3 py-1 text-xs rounded ${
              downloadFormat === 'svg'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            SVG
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            {copied ? (
              <>
                <FiCheck className="mr-2 h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <FiCopy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Download
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <FiShare2 className="mr-2 h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  )
}