/**
 * Aptos Payment Integration Example
 * 
 * This file demonstrates how to use the Aptos payment system in your components.
 * 
 * Usage:
 * 
 * 1. Send a payment:
 * ```tsx
 * import { useAptosPayment } from '@/integrations/aptos';
 * 
 * function PaymentComponent() {
 *   const { sendPayment, loading, connected } = useAptosPayment();
 *   
 *   const handleSend = async () => {
 *     await sendPayment('0xRecipientAddress', 1.5); // 1.5 APT
 *   };
 *   
 *   return (
 *     <button onClick={handleSend} disabled={!connected || loading}>
 *       Send Payment
 *     </button>
 *   );
 * }
 * ```
 * 
 * 2. Create a payment request:
 * ```tsx
 * const { createPaymentRequest } = useAptosPayment();
 * 
 * await createPaymentRequest('0xRecipient', 2.0, 'APT');
 * ```
 * 
 * 3. Fulfill a payment request:
 * ```tsx
 * const { fulfillPaymentRequest } = useAptosPayment();
 * 
 * await fulfillPaymentRequest('0xRequestOwner', 0); // Request ID 0
 * ```
 * 
 * 4. Get payment request details:
 * ```tsx
 * const { getPaymentRequest } = useAptosPayment();
 * 
 * const request = await getPaymentRequest('0xOwner', 0);
 * console.log(request); // { recipient, amount, tokenType, fulfilled, createdAt }
 * ```
 * 
 * 5. Check account balance:
 * ```tsx
 * const { getBalance } = useAptosPayment();
 * 
 * const balance = await getBalance(); // Current user's balance
 * const otherBalance = await getBalance('0xOtherAddress');
 * ```
 * 
 * 6. Direct wallet access:
 * ```tsx
 * import { useWallet } from '@/integrations/aptos';
 * 
 * function WalletButton() {
 *   const { address, connected, connect, disconnect } = useWallet();
 *   
 *   return (
 *     <button onClick={connected ? disconnect : connect}>
 *       {connected ? `Disconnect ${address?.slice(0, 6)}...` : 'Connect Wallet'}
 *     </button>
 *   );
 * }
 * ```
 */

export {};
