export enum MezoErrorCode {
  INSUFFICIENT_COLLATERAL = "INSUFFICIENT_COLLATERAL",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  APPROVAL_FAILED = "APPROVAL_FAILED",
  POSITION_AT_RISK = "POSITION_AT_RISK",
  NETWORK_ERROR = "NETWORK_ERROR",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  USER_REJECTED = "USER_REJECTED",
  UNKNOWN = "UNKNOWN",
}

export interface MezoError {
  code: MezoErrorCode;
  message: string;
  originalError?: Error | any;
  severity: "info" | "warning" | "error";
}

export const createMezoError = (
  code: MezoErrorCode,
  message: string,
  originalError?: Error | any,
  severity: "info" | "warning" | "error" = "error"
): MezoError => {
  return {
    code,
    message,
    originalError,
    severity,
  };
};

export const parseContractError = (error: any): MezoError => {
  const errorString = error?.message || error?.toString() || "";

  if (errorString.includes("insufficient balance")) {
    return createMezoError(
      MezoErrorCode.INSUFFICIENT_BALANCE,
      "Insufficient balance to complete this transaction",
      error,
      "warning"
    );
  }

  if (errorString.includes("User rejected")) {
    return createMezoError(
      MezoErrorCode.USER_REJECTED,
      "Transaction rejected by user",
      error,
      "info"
    );
  }

  if (errorString.includes("Network")) {
    return createMezoError(
      MezoErrorCode.NETWORK_ERROR,
      "Network error. Please check your connection",
      error,
      "warning"
    );
  }

  if (errorString.includes("position") || errorString.includes("health")) {
    return createMezoError(
      MezoErrorCode.POSITION_AT_RISK,
      "Position health is too low. Add more collateral or repay debt",
      error,
      "warning"
    );
  }

  if (errorString.includes("approve") || errorString.includes("allowance")) {
    return createMezoError(
      MezoErrorCode.APPROVAL_FAILED,
      "Failed to approve token. Please try again",
      error,
      "error"
    );
  }

  return createMezoError(
    MezoErrorCode.TRANSACTION_FAILED,
    "Transaction failed. Please try again",
    error,
    "error"
  );
};
