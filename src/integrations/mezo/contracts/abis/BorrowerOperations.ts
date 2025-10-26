export const BORROWER_OPERATIONS_ABI = [
  {
    inputs: [
      { name: "_maxFeePercentage", type: "uint256" },
      { name: "_collateral", type: "uint256" },
      { name: "_MUSDAmount", type: "uint256" },
      { name: "_upperHint", type: "address" },
      { name: "_lowerHint", type: "address" },
    ],
    name: "openTrove",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [
      { name: "_collateralAmount", type: "uint256" },
      { name: "_upperHint", type: "address" },
      { name: "_lowerHint", type: "address" },
    ],
    name: "addCollateral",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [
      { name: "_collateralAmount", type: "uint256" },
      { name: "_upperHint", type: "address" },
      { name: "_lowerHint", type: "address" },
    ],
    name: "withdrawCollateral",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [
      { name: "_MUSDAmount", type: "uint256" },
      { name: "_upperHint", type: "address" },
      { name: "_lowerHint", type: "address" },
    ],
    name: "repayMUSD",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [{ name: "_borrower", type: "address" }],
    name: "getTrove",
    outputs: [
      { name: "_collateral", type: "uint256" },
      { name: "_debt", type: "uint256" },
    ],
    type: "function",
    stateMutability: "view",
  },
] as const;
