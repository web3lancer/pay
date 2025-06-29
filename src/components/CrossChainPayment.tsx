import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CCIPService, CrossChainPayment as CCIPPayment, PaymentEstimate } from '../services/ccipService';
import { SUPPORTED_CHAINS } from '../config/chains';

interface CrossChainPaymentProps {
  freelancer: string;
  amount: string;
  token: string;
  milestoneId: string;
  onPaymentInitiated?: (messageId: string) => void;
  onPaymentCompleted?: (payment: CCIPPayment) => void;
}

const CrossChainPayment: React.FC<CrossChainPaymentProps> = ({
  freelancer,
  amount,
  token,
  milestoneId,
  onPaymentInitiated,
  onPaymentCompleted
}) => {
  const [sourceChain, setSourceChain] = useState<string>('');
  const [destinationChain, setDestinationChain] = useState<string>('');
  const [estimate, setEstimate] = useState<PaymentEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<CCIPPayment | null>(null);
  const [supportedRoutes, setSupportedRoutes] = useState<Array<{source: string, destination: string, tokens: string[]}>>([]);

  const ccipService = new CCIPService();

  useEffect(() => {
    const routes = ccipService.getSupportedRoutes();
    setSupportedRoutes(routes);
    
    // Set default chains if available
    if (routes.length > 0) {
      setSourceChain(routes[0].source);
      setDestinationChain(routes[0].destination);
    }
  }, []);

  useEffect(() => {
    if (sourceChain && destinationChain && token && amount) {
      estimatePayment();
    }
  }, [sourceChain, destinationChain, token, amount]);

  const estimatePayment = async () => {
    if (!sourceChain || !destinationChain) return;
    
    try {
      setIsLoading(true);
      const est = await ccipService.estimatePaymentFee(
        sourceChain,
        destinationChain,
        token,
        ethers.utils.parseEther(amount).toString()
      );
      setEstimate(est);
    } catch (error) {
      console.error('Estimation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!window.ethereum || !estimate) return;
    
    try {
      setIsLoading(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const messageId = await ccipService.initiateCrossChainPayment(
        signer,
        sourceChain,
        destinationChain,
        freelancer,
        ethers.utils.parseEther(amount).toString(),
        token,
        milestoneId
      );
      
      onPaymentInitiated?.(messageId);
      
      // Start monitoring the payment
      ccipService.monitorPayment(messageId, (payment) => {
        setCurrentPayment(payment);
        if (payment.status === 'Completed') {
          onPaymentCompleted?.(payment);
        }
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDestinations = () => {
    return supportedRoutes
      .filter(route => route.source === sourceChain && route.tokens.includes(token))
      .map(route => route.destination);
  };

  return (
    <div className="cross-chain-payment">
      <h3>Cross-Chain Payment</h3>
      
      <div className="chain-selection">
        <div className="form-group">
          <label>Source Chain:</label>
          <select 
            value={sourceChain} 
            onChange={(e) => setSourceChain(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select source chain</option>
            {Object.entries(SUPPORTED_CHAINS)
              .filter(([_, config]) => config.ccipRouter)
              .map(([chainId, config]) => (
                <option key={chainId} value={chainId}>
                  {config.name}
                </option>
              ))
            }
          </select>
        </div>
        
        <div className="form-group">
          <label>Destination Chain:</label>
          <select 
            value={destinationChain} 
            onChange={(e) => setDestinationChain(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select destination chain</option>
            {getAvailableDestinations().map(chainId => (
              <option key={chainId} value={chainId}>
                {SUPPORTED_CHAINS[chainId]?.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {estimate && (
        <div className="payment-estimate">
          <h4>Payment Estimate</h4>
          <div className="estimate-details">
            <div>
              <span>Cross-chain Fee:</span>
              <span>{ethers.utils.formatEther(estimate.fee)} ETH</span>
            </div>
            <div>
              <span>Estimated Time:</span>
              <span>{Math.ceil(estimate.estimatedTime / 60)} minutes</span>
            </div>
            <div>
              <span>Gas Limit:</span>
              <span>{Number(estimate.gasLimit).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {currentPayment && (
        <div className="payment-status">
          <h4>Payment Status</h4>
          <div className="status-details">
            <div>
              <span>Message ID:</span>
              <span className="message-id">{currentPayment.messageId}</span>
            </div>
            <div>
              <span>Status:</span>
              <span className={`status ${currentPayment.status.toLowerCase()}`}>
                {currentPayment.status}
              </span>
            </div>
            <div>
              <span>Amount:</span>
              <span>{ethers.utils.formatEther(currentPayment.amount)} tokens</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="payment-actions">
        <button 
          onClick={handlePayment}
          disabled={isLoading || !estimate || !sourceChain || !destinationChain}
          className="btn-primary"
        >
          {isLoading ? 'Processing...' : 'Send Cross-Chain Payment'}
        </button>
        
        {!estimate && sourceChain && destinationChain && (
          <button onClick={estimatePayment} className="btn-secondary">
            Get Estimate
          </button>
        )}
      </div>
      
      <style jsx>{`
        .cross-chain-payment {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .chain-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .form-group select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .payment-estimate, .payment-status {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .estimate-details, .status-details {
          display: grid;
          gap: 10px;
        }
        
        .estimate-details > div, .status-details > div {
          display: flex;
          justify-content: space-between;
        }
        
        .message-id {
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .status.pending { background: #ffeaa7; }
        .status.intransit { background: #74b9ff; color: white; }
        .status.completed { background: #00b894; color: white; }
        .status.failed { background: #e17055; color: white; }
        .status.disputed { background: #fd79a8; color: white; }
        
        .payment-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-primary, .btn-secondary {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
        }
        
        .btn-primary {
          background: #0066cc;
          color: white;
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #666;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CrossChainPayment;
