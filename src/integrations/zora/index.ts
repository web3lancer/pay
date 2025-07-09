// --- Zora Integration Barrel ---
// All Zora SDK/API usage is initialized with the ZORA_API key via sdk.ts

export * from "./sdk";
export * from "./coin";
export * from "./trade";
export * from "./update";
export * from "./types";

// Queries (details, explore, profile, onchain, etc.)
export * as zoraQueries from "./queries";

// Contract-level helpers (factory, metadata, rewards, etc.)
export * as zoraContracts from "./contracts";

// UI widgets for integration in pages
export { default as ZoraTradeWidget } from "./ui/ZoraTradeWidget";
export { default as ZoraUpdateWidget } from "./ui/ZoraUpdateWidget";

// Add more UI widgets here as needed (e.g., ZoraCoinCreateWidget, ZoraProfileWidget, etc.)
