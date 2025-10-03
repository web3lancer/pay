'use client';

import { useState } from 'react';
import { useWallet } from './wallet';
import { 
  sendPayment, 
  createPaymentRequest, 
  fulfillPaymentRequest,
  getPaymentRequest,
  getRequestCount,
  getAccountBalance
} from './payments';
import toast from 'react-hot-toast';

export function useAptosPayment() {
  const { address, connected, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const send = async (recipient: string, amount: number) => {
    if (!connected || !address) {
      toast.error('Please connect your Aptos wallet');
      return null;
    }

    setLoading(true);
    try {
      const amountInOctas = amount * 100_000_000; // Convert APT to Octas
      const result = await sendPayment(recipient, amountInOctas, signAndSubmitTransaction);
      toast.success('Payment sent successfully!');
      return result;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || 'Failed to send payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (recipient: string, amount: number, tokenType = 'APT') => {
    if (!connected || !address) {
      toast.error('Please connect your Aptos wallet');
      return null;
    }

    setLoading(true);
    try {
      const amountInOctas = amount * 100_000_000;
      const result = await createPaymentRequest(recipient, amountInOctas, tokenType, signAndSubmitTransaction);
      toast.success('Payment request created!');
      return result;
    } catch (error: any) {
      console.error('Create request error:', error);
      toast.error(error?.message || 'Failed to create payment request');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fulfillRequest = async (requestOwner: string, requestId: number) => {
    if (!connected || !address) {
      toast.error('Please connect your Aptos wallet');
      return null;
    }

    setLoading(true);
    try {
      const result = await fulfillPaymentRequest(requestOwner, requestId, signAndSubmitTransaction);
      toast.success('Payment request fulfilled!');
      return result;
    } catch (error: any) {
      console.error('Fulfill request error:', error);
      toast.error(error?.message || 'Failed to fulfill payment request');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRequest = async (owner: string, requestId: number) => {
    try {
      return await getPaymentRequest(owner, requestId);
    } catch (error) {
      console.error('Get request error:', error);
      return null;
    }
  };

  const getBalance = async (addr?: string) => {
    try {
      const targetAddress = addr || address;
      if (!targetAddress) return null;
      return await getAccountBalance(targetAddress);
    } catch (error) {
      console.error('Get balance error:', error);
      return null;
    }
  };

  const getUserRequestCount = async (owner: string) => {
    try {
      return await getRequestCount(owner);
    } catch (error) {
      console.error('Get request count error:', error);
      return 0;
    }
  };

  return {
    address,
    connected,
    loading,
    sendPayment: send,
    createPaymentRequest: createRequest,
    fulfillPaymentRequest: fulfillRequest,
    getPaymentRequest: getRequest,
    getRequestCount: getUserRequestCount,
    getBalance,
  };
}
