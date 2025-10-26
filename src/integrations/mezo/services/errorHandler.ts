"use client";

import toast from "react-hot-toast";
import { MezoError, parseContractError, MezoErrorCode } from "@/integrations/mezo/types/errors";

/**
 * Handle Mezo errors and display toast notifications
 * @param error - Error object
 * @param context - Context for the error (e.g., "openPosition", "repay")
 */
export const handleMezoError = (error: any, context?: string): MezoError => {
  const mezoError = parseContractError(error);

  // Display toast based on severity
  switch (mezoError.severity) {
    case "error":
      toast.error(mezoError.message);
      break;
    case "warning":
      toast.error(mezoError.message);
      break;
    case "info":
      toast.success(mezoError.message);
      break;
  }

  // Log for debugging
  console.error(`[Mezo Error - ${context || "Unknown"}]`, {
    code: mezoError.code,
    message: mezoError.message,
    severity: mezoError.severity,
    originalError: mezoError.originalError,
  });

  return mezoError;
};

/**
 * Format Mezo error for UI display
 */
export const formatMezoError = (error: MezoError | any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error: any, code: MezoErrorCode): boolean => {
  return error?.code === code || error?.message?.includes(code);
};
