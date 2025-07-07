import { Backstop, BackstopPool, BackstopPoolEst, BackstopPoolUser, BackstopPoolUserEst } from '../sdk';

export class BlendBackstopService {
  static async loadBackstop(network: any, backstopId: string) {
    return Backstop.load(network, backstopId);
  }

  static async loadBackstopPool(network: any, backstopId: string, poolId: string) {
    return BackstopPool.load(network, backstopId, poolId);
  }

  static buildBackstopPoolEst(backstopToken: any, poolBalance: any) {
    return BackstopPoolEst.build(backstopToken, poolBalance);
  }

  static async loadBackstopPoolUser(network: any, backstopId: string, poolId: string, userId: string) {
    return BackstopPoolUser.load(network, backstopId, poolId, userId);
  }

  static buildBackstopPoolUserEst(backstop: any, backstopPool: any, backstopPoolUser: any) {
    return BackstopPoolUserEst.build(backstop, backstopPool, backstopPoolUser);
  }
}
