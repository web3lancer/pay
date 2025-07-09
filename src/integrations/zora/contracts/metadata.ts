import { validateMetadataJSON, validateMetadataURIContent } from "@zoralabs/coins-sdk";

// Validate metadata JSON structure
export function validateCoinMetadataJSON(metadata: object) {
  return validateMetadataJSON(metadata);
}

// Validate metadata URI (ipfs:// or https://)
export async function validateCoinMetadataURI(uri: string) {
  return validateMetadataURIContent(uri);
}
