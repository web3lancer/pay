import { useState } from "react";
import { tradeZoraCoin } from "../trade";
import type { TradeParameters } from "@zoralabs/coins-sdk";

export default function ZoraTradeWidget() {
  const [form, setForm] = useState<Partial<TradeParameters>>({});
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTrade = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // You should validate and parse form values properly in production
      const tradeParameters: TradeParameters = {
        ...form,
        // Example: hardcoded for demo, replace with actual form values
        sell: { type: "eth" },
        buy: { type: "erc20", address: (form as any).buyAddress },
        amountIn: BigInt(form.amountIn || "0"),
        slippage: Number(form.slippage || 0.05),
        sender: account as `0x${string}`,
      };
      const receipt = await tradeZoraCoin({ tradeParameters, account });
      setResult(receipt);
    } catch (err: any) {
      setError(err?.message || "Trade failed");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-md">
      <h3 className="font-bold text-lg mb-2">Zora Coin Trade</h3>
      <input
        type="text"
        name="account"
        placeholder="Your wallet address"
        value={account}
        onChange={e => setAccount(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        name="buyAddress"
        placeholder="Buy token address"
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        name="amountIn"
        placeholder="Amount in (wei)"
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        name="slippage"
        placeholder="Slippage (e.g. 0.05)"
        onChange={handleChange}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <button
        onClick={handleTrade}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
      >
        {loading ? "Trading..." : "Trade"}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="text-green-600 text-sm break-all">
          Trade successful! Tx: {result?.transactionHash || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
