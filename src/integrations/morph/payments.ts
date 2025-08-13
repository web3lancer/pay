import { getPaylancerContractWithSigner, getPaylancerContract } from './contract';
import { ethers } from 'ethers';

const ENABLE_MORPH =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_INTEGRATION_MORPH === undefined || process.env.NEXT_PUBLIC_INTEGRATION_MORPH === 'true');

export async function sendPayment(recipient: string, amount: ethers.BigNumberish, signer: ethers.Signer) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContractWithSigner(signer);
  const tx = await contract.sendPayment(recipient, { value: amount });
  return tx;
}

export async function sendTokenPayment(recipient: string, amount: ethers.BigNumberish, token: string, signer: ethers.Signer) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContractWithSigner(signer);
  const tx = await contract.sendTokenPayment(recipient, amount, token);
  return tx;
}

export async function createPaymentRequest(recipient: string, amount: ethers.BigNumberish, token: string, signer: ethers.Signer) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContractWithSigner(signer);
  const tx = await contract.createPaymentRequest(recipient, amount, token);
  return tx;
}

export async function fulfillPaymentRequestETH(requestId: number, amount: ethers.BigNumberish, signer: ethers.Signer) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContractWithSigner(signer);
  const tx = await contract.fulfillPaymentRequestETH(requestId, { value: amount });
  return tx;
}

export async function fulfillPaymentRequestToken(requestId: number, signer: ethers.Signer) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContractWithSigner(signer);
  const tx = await contract.fulfillPaymentRequestToken(requestId);
  return tx;
}

export async function getPaymentRequest(requestId: number) {
  if (!ENABLE_MORPH) return null;
  const contract = getPaylancerContract();
  return await contract.paymentRequests(requestId);
}
