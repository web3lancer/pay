'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { usePaymentRequest as usePaymentRequestContextHook } from '@/contexts/PaymentRequestContext' // Aliased
import { DatabaseService, PaymentRequest as PaymentRequestType } from '@/lib/database' // Aliased
import { generatePaymentQR } from '@/lib/qr'
import { AppShell } from '@/components/AppShell'
import { FiCreditCard, FiCheck, FiAlertCircle, FiClock, FiUser, FiDollarSign } from 'react-icons/fi'

// Import PaymentProfileClient from its current location
// This path will need to be updated by the user after moving the file
import { PaymentProfileClient } from './PaymentProfileClient' 

export default function PaySlugPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { wallets } = useWallet()
  const { sendTransaction } = useTransaction()
  const { payPaymentRequest } = usePaymentRequestContextHook()
  
  const slug = params.slug as string;

  const [pageType, setPageType] = useState<'loading' | 'paymentRequest' | 'userProfile'>('loading');

  // States for Payment Request part (from original [id]/page.tsx)
  const [paymentRequestData, setPaymentRequestData] = useState<PaymentRequestType | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoadingPaymentRequest, setIsLoadingPaymentRequest] = useState(true); // Specific to PR loading
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentRequestError, setPaymentRequestError] = useState('');
  const [paymentRequestSuccess, setPaymentRequestSuccess] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  useEffect(() => {
    if (!slug) {
      setPageType('loading'); // Or handle as an error
      return;
    }

    setIsLoadingPaymentRequest(true); // For the payment request path
    setPaymentRequestData(null);    // Reset
    setPaymentRequestError('');
    setPaymentRequestSuccess('');
    setQrCodeUrl(null);

    const checkSlugType = async () => {
      try {
        // Attempt to fetch as a PaymentRequest using the slug as ID
        const request = await DatabaseService.getPaymentRequest(slug);
        if (request && request.requestId === slug) { // Ensure it's a valid request for this slug
          setPaymentRequestData(request);
          setPageType('paymentRequest');
          
          const qrUrl = await generatePaymentQR({
            requestId: request.requestId,
            amount: request.amount,
            tokenId: request.tokenId,
            description: request.description
          });
          setQrCodeUrl(qrUrl);
          
          if (wallets.length > 0) {
            const compatibleWallet = wallets.find(w => 
              getCompatibleTokens(w.blockchain).includes(request.tokenId)
            );
            if (compatibleWallet) {
              setSelectedWalletId(compatibleWallet.walletId);
            } else {
              setSelectedWalletId('');
            }
          } else {
            setSelectedWalletId('');
          }
        } else {
          setPageType('userProfile');
        }
      } catch (error) {
        console.warn(`Error fetching payment request for slug "${slug}", assuming user profile:`, error);
        setPageType('userProfile');
      } finally {
        setIsLoadingPaymentRequest(false); 
      }
    };

    checkSlugType();
  }, [slug, wallets]);

  const getCompatibleTokens = (blockchain: string): string[] => {
    const tokens: Record<string, string[]> = {
      bitcoin: ['btc'],
      ethereum: ['eth', 'usdt', 'usdc'],
      polygon: ['matic', 'usdc'],
      bsc: ['bnb', 'usdt']
    };
    return tokens[blockchain] || [];
  };

  const getCompatibleWalletsForPayment = () => {
    if (!paymentRequestData) return [];
    return wallets.filter(wallet => 
      getCompatibleTokens(wallet.blockchain).includes(paymentRequestData.tokenId)
    );
  };

  const handlePayment = async () => {
    if (!user || !paymentRequestData || !selectedWalletId) return;

    setIsProcessingPayment(true);
    setPaymentRequestError('');
    setPaymentRequestSuccess('');

    try {
      const transaction = await sendTransaction({
        toAddress: 'mock-payment-address',
        tokenId: paymentRequestData.tokenId,
        amount: paymentRequestData.amount,
        description: `Payment for ${paymentRequestData.invoiceNumber}`,
        fromWalletId: selectedWalletId,
        fromUserId: '',
        fromAddress: '',
        feeAmount: '',
        status: 'pending',
        type: 'send',
        confirmations: 0
      });
      await payPaymentRequest(paymentRequestData.requestId, transaction.transactionId);
      setPaymentRequestSuccess('Payment sent successfully!');
      setTimeout(() => {
        router.push('/transactions');
      }, 3000);
    } catch (error: any) {
      setPaymentRequestError(error.message || 'Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTokenSymbol = (tokenId: string) => {
    const symbols: Record<string, string> = {
      btc: 'BTC',
      eth: 'ETH',
      matic: 'MATIC',
      bnb: 'BNB',
      usdt: 'USDT',
      usdc: 'USDC'
    };
    return symbols[tokenId] || tokenId.toUpperCase();
  };

  const isOverdue = () => {
    if (!paymentRequestData?.dueDate) return false;
    return new Date(paymentRequestData.dueDate) < new Date();
  };

  if (pageType === 'loading') {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (pageType === 'paymentRequest') {
    if (isLoadingPaymentRequest && !paymentRequestData) {
      return (
        <AppShell>
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading payment request...</p>
            </div>
          </div>
        </AppShell>
      );
    }

    if (paymentRequestError && !paymentRequestData) {
      return (
        <AppShell>
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <div className="text-red-400 mb-4"><FiAlertCircle className="w-12 h-12 mx-auto" /></div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">Payment Request Not Found</h3>
              <p className="text-neutral-500">{paymentRequestError}</p>
            </div>
          </div>
        </AppShell>
      );
    }

    if (!paymentRequestData) {
        return (
             <AppShell>
                <div className="container mx-auto px-4 py-6 max-w-2xl">
                    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
                        <FiAlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-700 mb-2">Invalid Payment Request</h3>
                        <p className="text-neutral-500">The payment request could not be displayed.</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    const compatibleWallets = getCompatibleWalletsForPayment();
    const _isOverdue = isOverdue();

    return (
        <AppShell>
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Request</h1>
                <p className="text-neutral-600">Invoice #{paymentRequestData.invoiceNumber}</p>
              </div>
              <div className="flex justify-center mb-6">
                {paymentRequestData.status === 'paid' ? (
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full"><FiCheck className="w-4 h-4 mr-2" />Paid</span>
                ) : paymentRequestData.status === 'cancelled' ? (
                  <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full"><FiAlertCircle className="w-4 h-4 mr-2" />Cancelled</span>
                ) : _isOverdue ? (
                  <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full"><FiClock className="w-4 h-4 mr-2" />Overdue</span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full"><FiClock className="w-4 h-4 mr-2" />Pending Payment</span>
                )}
              </div>
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {paymentRequestData.amount} {getTokenSymbol(paymentRequestData.tokenId)}
                </div>
                {paymentRequestData.description && (<p className="text-neutral-600">{paymentRequestData.description}</p>)}
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Created</span>
                  <span className="font-medium">{formatDate(paymentRequestData.createdAt)}</span>
                </div>
                {paymentRequestData.dueDate && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Due Date</span>
                    <span className={`font-medium ${_isOverdue ? 'text-red-600' : ''}`}>{formatDate(paymentRequestData.dueDate)}</span>
                  </div>
                )}
                {paymentRequestData.toEmail && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Recipient</span>
                    <span className="font-medium">{paymentRequestData.toEmail}</span>
                  </div>
                )}
              </div>
              {qrCodeUrl && paymentRequestData.status === 'pending' && (
                <div className="bg-neutral-50 rounded-lg p-6 mb-8 text-center">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Scan to Pay</h3>
                  <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto mb-4 border border-neutral-200 rounded-lg" width={200} height={200} />
                  <p className="text-sm text-neutral-600">Scan this QR code with your wallet app to pay</p>
                </div>
              )}
              {paymentRequestError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center"><FiAlertCircle className="w-5 h-5 text-red-500 mr-2" /><span className="text-red-700">{paymentRequestError}</span></div>
                </div>
              )}
              {paymentRequestSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center"><FiCheck className="w-5 h-5 text-green-500 mr-2" /><span className="text-green-700">{paymentRequestSuccess}</span></div>
                </div>
              )}
              {paymentRequestData.status === 'pending' && user && (
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4"><FiCreditCard className="w-5 h-5 inline mr-2" />Pay with Your Wallet</h3>
                  {compatibleWallets.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-700">You don't have any wallets compatible with {getTokenSymbol(paymentRequestData.tokenId)}. Please add a compatible wallet first.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Select Wallet</label>
                        <select value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                          <option value="">Choose a wallet</option>
                          {compatibleWallets.map((wallet) => (<option key={wallet.walletId} value={wallet.walletId}>{wallet.walletName} ({wallet.blockchain}) - Balance: {wallet.balance}</option>))}
                        </select>
                      </div>
                      <button onClick={handlePayment} disabled={isProcessingPayment || !selectedWalletId} className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                        {isProcessingPayment ? ('Processing Payment...') : (<><FiDollarSign className="w-5 h-5 mr-2" />Pay {paymentRequestData.amount} {getTokenSymbol(paymentRequestData.tokenId)}</>)}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {paymentRequestData.status === 'paid' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-900 mb-2">Payment Completed</h3>
                  <p className="text-green-700">This payment request has been paid{paymentRequestData.paidAt && ` on ${formatDate(paymentRequestData.paidAt)}`}.</p>
                </div>
              )}
              {!user && paymentRequestData.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <FiUser className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Sign In to Pay</h3>
                  <p className="text-blue-700 mb-4">You need to sign in to make a payment.</p>
                  <button onClick={() => router.push('/login')} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Sign In</button>
                </div>
              )}
            </div>
          </div>
        </AppShell>
      );
  }

  if (pageType === 'userProfile') {
    return <PaymentProfileClient username={slug} />;
  }

  return null; 
}
