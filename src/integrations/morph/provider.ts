import { ethers } from 'ethers';

// Morph Holesky RPC endpoint
export const MORPH_HOLESKY_RPC = 'https://rpc-quicknode-holesky.morphl2.io';

// Create a default provider for Morph Holesky
export function getMorphProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MORPH_HOLESKY_RPC);
}

// Optionally, export a WebSocket provider for subscriptions
export function getMorphWebSocketProvider(): ethers.WebSocketProvider {
  return new ethers.WebSocketProvider('wss://rpc-quicknode-holesky.morphl2.io');
}
