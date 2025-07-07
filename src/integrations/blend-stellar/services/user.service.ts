import { Pool, PositionsEstimate } from '../sdk';

export class BlendUserService {
  static async loadUserPosition(pool: any, userId: string) {
    return pool.loadUser(userId);
  }

  static buildUserEstimate(pool: any, oracle: any, positions: any) {
    return PositionsEstimate.build(pool, oracle, positions);
  }
}
