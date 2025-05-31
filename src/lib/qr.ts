// Simple QR code placeholder - in real app, use qrcode library
export const generatePaymentQR = async (paymentData: {
  requestId: string
  amount: string
  tokenId: string
  description?: string
}) => {
  const paymentUrl = `${window.location.origin}/pay/${paymentData.requestId}`
  
  // Mock QR code data URL - in real app, generate actual QR code
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR CODE</text>
      <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="black">Payment Request</text>
    </svg>
  `)}`
}

export const generateWalletAddressQR = async (address: string, tokenSymbol?: string) => {
  // Mock QR code data URL - in real app, generate actual QR code
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR CODE</text>
      <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${tokenSymbol || 'Address'}</text>
      <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="6" fill="black">${address.slice(0, 12)}...</text>
    </svg>
  `)}`
}