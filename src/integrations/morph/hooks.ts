import { useState, useCallback } from 'react';
import { useWallet } from './wallet';
import {
  sendPayment,
  sendTokenPayment,
  createPaymentRequest,
  fulfillPaymentRequestETH,
  fulfillPaymentRequestToken,
  getPaymentRequest,
} from './payments';
import { ethers } from 'ethers';

const ENABLE_MORPH =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_INTEGRATION_MORPH === undefined || process.env.NEXT_PUBLIC_INTEGRATION_MORPH === 'true');

export function useSendPayment() {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<any>(null);

  const send = useCallback(async (recipient: string, amount: ethers.BigNumberish) => {
    if (!ENABLE_MORPH || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const txRes = await sendPayment(recipient, amount, signer);
      setTx(txRes);
    } catch (err: any) {
      setError(err.message || 'Error sending payment');
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { send, loading, error, tx };
}

export function useSendTokenPayment() {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<any>(null);

  const send = useCallback(async (recipient: string, amount: ethers.BigNumberish, token: string) => {
    if (!ENABLE_MORPH || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const txRes = await sendTokenPayment(recipient, amount, token, signer);
      setTx(txRes);
    } catch (err: any) {
      setError(err.message || 'Error sending token payment');
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { send, loading, error, tx };
}

export function useCreatePaymentRequest() {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<any>(null);

  const create = useCallback(async (recipient: string, amount: ethers.BigNumberish, token: string) => {
    if (!ENABLE_MORPH || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const txRes = await createPaymentRequest(recipient, amount, token, signer);
      setTx(txRes);
    } catch (err: any) {
      setError(err.message || 'Error creating payment request');
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { create, loading, error, tx };
}

export function useFulfillPaymentRequestETH() {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<any>(null);

  const fulfill = useCallback(async (requestId: number, amount: ethers.BigNumberish) => {
    if (!ENABLE_MORPH || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const txRes = await fulfillPaymentRequestETH(requestId, amount, signer);
      setTx(txRes);
    } catch (err: any) {
      setError(err.message || 'Error fulfilling ETH payment request');
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { fulfill, loading, error, tx };
}

export function useFulfillPaymentRequestToken() {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<any>(null);

  const fulfill = useCallback(async (requestId: number) => {
    if (!ENABLE_MORPH || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const txRes = await fulfillPaymentRequestToken(requestId, signer);
      setTx(txRes);
    } catch (err: any) {
      setError(err.message || 'Error fulfilling token payment request');
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { fulfill, loading, error, tx };
}

export function usePaymentRequest(requestId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetch = useCallback(async () => {
    if (!ENABLE_MORPH) return;
    setLoading(true);
    setError(null);
    try {
      const req = await getPaymentRequest(requestId);
      setData(req);
    } catch (err: any) {
      setError(err.message || 'Error fetching payment request');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  return { fetch, loading, error, data };
}
