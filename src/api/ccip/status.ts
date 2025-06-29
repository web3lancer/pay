import { NextApiRequest, NextApiResponse } from 'next';
import { CCIPService } from '../../services/ccipService';
import { SUPPORTED_CHAINS } from '../../config/chains';

interface StatusRequest {
  messageId: string;
  chainId?: string;
}

interface StatusResponse {
  success: boolean;
  payment?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { messageId, chainId } = req.query as { messageId: string; chainId?: string };

  if (!messageId) {
    return res.status(400).json({ success: false, error: 'Message ID is required' });
  }

  try {
    const ccipService = new CCIPService();
    
    if (chainId) {
      // Check specific chain
      const payment = await ccipService.getPaymentStatus(chainId, messageId);
      return res.status(200).json({ success: true, payment });
    } else {
      // Check all supported chains
      for (const supportedChainId of Object.keys(SUPPORTED_CHAINS)) {
        const payment = await ccipService.getPaymentStatus(supportedChainId, messageId);
        if (payment) {
          return res.status(200).json({ success: true, payment });
        }
      }
      
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
