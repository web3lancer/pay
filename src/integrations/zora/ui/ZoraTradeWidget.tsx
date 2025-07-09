import { useState, useEffect } from "react";
import { tradeZoraCoin } from "../trade";
import { fetchTopGainers } from "../queries/explore";
import type { TradeParameters } from "@zoralabs/coins-sdk";
import { parseEther } from "viem";

interface ZoraTradeWidgetProps {
  context?: "send" | "request" | "settings";
  suggestedAmount?: string;
  suggestedToken?: string;
}

export default function ZoraTradeWidget({
  context = "send",
  suggestedAmount = "",
  suggestedToken = "",
}: ZoraTradeWidgetProps) {
  const [topCoins, setTopCoins] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [amount, setAmount] = useState(suggestedAmount);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Fetch top Zora coins on mount
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setLoadingCoins(true);
        const response = await fetchTopGainers({ count: 5 });
        const coins =
          response.data?.exploreList?.edges?.map((edge: any) => edge.node) ||
          [];
        setTopCoins(coins);
        if (coins.length > 0 && !selectedCoin) {
          setSelectedCoin(coins[0].address);
        }
      } catch (err) {
        console.error("Failed to fetch top coins:", err);
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchTopCoins();
  }, []);

  const handleTrade = async () => {
    if (!selectedCoin || !amount || !account) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const tradeParameters: TradeParameters = {
        sell: { type: "eth" },
        buy: { type: "erc20", address: selectedCoin as `0x${string}` },
        amountIn: parseEther(amount),
        slippage: 0.05,
        sender: account as `0x${string}`,
      };

      const receipt = await tradeZoraCoin({ tradeParameters, account });
      setResult(receipt);
    } catch (err: any) {
      setError(err?.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  const getContextualTitle = () => {
    switch (context) {
      case "send":
        return "Send with Zora Coins";
      case "request":
        return "Request Zora Coin Payment";
      case "settings":
        return "Manage Zora Coins";
      default:
        return "Zora Coin Trade";
    }
  };

  const getContextualDescription = () => {
    switch (context) {
      case "send":
        return "Convert ETH to trending Zora coins for your payment";
      case "request":
        return "Request payment in popular Zora coins";
      case "settings":
        return "Trade and manage your Zora coin portfolio";
      default:
        return "Trade Zora coins";
    }
  };

  if (loadingCoins) {
    return (
      <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-md">
      <div>
        <h3 className="font-bold text-lg mb-1">{getContextualTitle()}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {getContextualDescription()}
        </p>
      </div>

      {topCoins.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Trending Coin:
          </label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          >
            {topCoins.map((coin) => (
              <option key={coin.address} value={coin.address}>
                {coin.name} ({coin.symbol}) -{" "}
                {coin.marketCapDelta24h
                  ? `${parseFloat(coin.marketCapDelta24h).toFixed(2)}%`
                  : "N/A"}
              </option>
            ))}
          </select>
        </div>
      )}

      <input
        type="text"
        placeholder="Your wallet address"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />

      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />

      <button
        onClick={handleTrade}
        disabled={loading || !selectedCoin || !amount || !account}
        className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 w-full"
      >
        {loading
          ? "Trading..."
          : context === "request"
          ? "Create Request"
          : "Trade Now"}
      </button>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="text-green-600 text-sm break-all">
          {context === "request"
            ? "Payment request created!"
            : "Trade successful!"}{" "}
          Tx: {result?.transactionHash || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
