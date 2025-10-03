import { getAptosClient, getModuleAddress, isAptosEnabled } from './client';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';

export async function sendPayment(
  recipient: string,
  amount: number,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>
) {
  if (!isAptosEnabled()) return null;

  const moduleAddress = getModuleAddress();
  if (!moduleAddress) {
    throw new Error('Module address not configured');
  }

  const transaction: InputTransactionData = {
    data: {
      function: `${moduleAddress}::payment_system::send_payment`,
      functionArguments: [recipient, amount],
    },
  };

  const response = await signAndSubmitTransaction(transaction);
  return response;
}

export async function createPaymentRequest(
  recipient: string,
  amount: number,
  tokenType: string,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>
) {
  if (!isAptosEnabled()) return null;

  const moduleAddress = getModuleAddress();
  if (!moduleAddress) {
    throw new Error('Module address not configured');
  }

  const transaction: InputTransactionData = {
    data: {
      function: `${moduleAddress}::payment_system::create_payment_request`,
      functionArguments: [recipient, amount, tokenType],
    },
  };

  const response = await signAndSubmitTransaction(transaction);
  return response;
}

export async function fulfillPaymentRequest(
  requestOwner: string,
  requestId: number,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>
) {
  if (!isAptosEnabled()) return null;

  const moduleAddress = getModuleAddress();
  if (!moduleAddress) {
    throw new Error('Module address not configured');
  }

  const transaction: InputTransactionData = {
    data: {
      function: `${moduleAddress}::payment_system::fulfill_payment_request`,
      functionArguments: [requestOwner, requestId],
    },
  };

  const response = await signAndSubmitTransaction(transaction);
  return response;
}

export async function getPaymentRequest(owner: string, requestId: number) {
  if (!isAptosEnabled()) return null;

  const aptos = getAptosClient();
  const moduleAddress = getModuleAddress();
  
  if (!aptos || !moduleAddress) {
    throw new Error('Aptos client or module address not configured');
  }

  try {
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::payment_system::get_payment_request`,
        functionArguments: [owner, requestId],
      },
    });

    return {
      recipient: result[0] as string,
      amount: Number(result[1]),
      tokenType: result[2] as string,
      fulfilled: result[3] as boolean,
      createdAt: Number(result[4]),
    };
  } catch (error) {
    console.error('Error fetching payment request:', error);
    return null;
  }
}

export async function getRequestCount(owner: string) {
  if (!isAptosEnabled()) return 0;

  const aptos = getAptosClient();
  const moduleAddress = getModuleAddress();
  
  if (!aptos || !moduleAddress) {
    throw new Error('Aptos client or module address not configured');
  }

  try {
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::payment_system::get_request_count`,
        functionArguments: [owner],
      },
    });

    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching request count:', error);
    return 0;
  }
}

export async function getAccountBalance(address: string) {
  if (!isAptosEnabled()) return null;

  const aptos = getAptosClient();
  if (!aptos) return null;

  try {
    const resources = await aptos.getAccountCoinsData({ accountAddress: address });
    return resources;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}
