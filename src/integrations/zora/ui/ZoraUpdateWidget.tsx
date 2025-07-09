import { useState } from "react";
import { updateZoraCoinURI, updateZoraPayoutRecipient } from "../update";

export default function ZoraUpdateWidget() {
  const [account, setAccount] = useState("");
  const [coin, setCoin] = useState("");
  const [newURI, setNewURI] = useState("");
  const [newPayout, setNewPayout] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateURI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await updateZoraCoinURI(
        { coin: coin as `0x${string}`, newURI },
        account
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
    setLoading(false);
  };

  const handleUpdatePayout = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await updateZoraPayoutRecipient(
        { coin: coin as `0x${string}`, newPayoutRecipient: newPayout as `0x${string}` },
        account
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-md">
      <h3 className="font-bold text-lg mb-2">Zora Coin Update</h3>
      <input
        type="text"
        placeholder="Your wallet address"
        value={account}
        onChange={e => setAccount(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Coin contract address"
        value={coin}
        onChange={e => setCoin(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="New metadata URI (ipfs://...)"
        value={newURI}
        onChange={e => setNewURI(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <button
        onClick={handleUpdateURI}
        disabled={loading || !account || !coin || !newURI}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2"
      >
        {loading ? "Updating..." : "Update Metadata URI"}
      </button>
      <input
        type="text"
        placeholder="New payout recipient address"
        value={newPayout}
        onChange={e => setNewPayout(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <button
        onClick={handleUpdatePayout}
        disabled={loading || !account || !coin || !newPayout}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        {loading ? "Updating..." : "Update Payout Recipient"}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="text-green-600 text-sm break-all">
          Update successful! Tx: {result?.hash || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
