import { Pool, PoolEstimate, PoolOracle, Network } from '../sdk';

export class BlendPoolService {
  static async loadPool(network: Network, poolId: string) {
    return Pool.load(network, poolId);
  }

  static async loadPoolOracle(pool: any) {
    return pool.loadOracle();
  }

  static buildPoolEstimate(reserves: any, oracle: any) {
    return PoolEstimate.build(reserves, oracle);
  }
}
