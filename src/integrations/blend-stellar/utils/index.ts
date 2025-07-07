export function isStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}
