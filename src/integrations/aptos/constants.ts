export const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "testnet";
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
export const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_FA_CREATOR_ADDRESS;
export const FA_ADDRESS = process.env.NEXT_PUBLIC_FA_ADDRESS;
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const ENABLE_APTOS = process.env.NEXT_PUBLIC_INTEGRATION_APTOS === "true";
