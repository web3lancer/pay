import { ethers } from 'ethers';
import { getMorphProvider } from './provider';

// Import ABI (replace with actual Paylancer ABI import)
import PaylancerABI from '@/integrations/morph/PaylancerABI.json';

// Contract address should be set via env/config/context
export const PAYLANCER_ADDRESS = process.env.NEXT_PUBLIC_PAYLANCER_ADDRESS || '';

// Returns a contract instance (read-only)
export function getPaylancerContract(): ethers.Contract {
  return new ethers.Contract(PAYLANCER_ADDRESS, PaylancerABI, getMorphProvider());
}

// Returns a contract instance with signer (for write calls)
export function getPaylancerContractWithSigner(signer: ethers.Signer): ethers.Contract {
  return new ethers.Contract(PAYLANCER_ADDRESS, PaylancerABI, signer);
}
