import { useState, useEffect } from "react";
import { updateZoraCoinURI, updateZoraPayoutRecipient } from "../update";
import { fetchProfileBalances } from "../queries/profile";

export default function ZoraUpdateWidget() {
  const [account, setAccount] = useState("");
  const [userCoins, setUserCoins] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [newURI, setNewURI] = useState("");
  const [newPayout, setNewPayout] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch user's coins when account changes
  useEffect(() => {
    if (account && account.startsWith("0x")) {
      fetchUserCoins();
    }
  }, [account]);

  const fetchUserCoins = async () => {
    setLoadingProfile(true);
    try {
      const response = await fetchProfileBalances({ address: account });
      const profile = response.data?.profile;
      const balances = profile?.coinBalances?.edges?.map((edge: any) => edge.node) || [];
      setUserCoins(balances.filter(balance => parseFloat(balance.amount?.amountDecimal || "0") > 0));
    } catch (err) {
      console.error("Failed to fetch user coins:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateURI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await updateZoraCoinURI(
        { coin: selectedCoin as `0x${string}`, newURI },
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
        { coin: selectedCoin as `0x${string}`, newPayoutRecipient: newPayout as `0x${string}` },
        account
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Update failed");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-2xl">
      <div>
        <h3 className="font-bold text-lg mb-1">Zora Coin Management</h3>
        <p className="text-sm text-gray-600 mb-4">Update metadata and payout settings for your Zora coins</p>
      </div>

      <input
        type="text"
        placeholder="Your wallet address (0x...)"
        value={account}
        onChange={e => setAccount(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />

      {loadingProfile && (
        <div className="text-sm text-gray-500">Loading your coins...</div>
      )}

      {userCoins.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Your Coins:</label>
          <select
            value={selectedCoin}
            onChange={e => setSelectedCoin(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          >
            <option value="">Select a coin to manage</option>
            {userCoins.map(balance => (
              <option key={balance.token?.address} value={balance.token?.address}>
                {balance.token?.name} ({balance.token?.symbol}) - {balance.amount?.amountDecimal} tokens
              </option>
            ))}
          </select>
        </div>
      )}

      {account && userCoins.length === 0 && !loadingProfile && (
        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
          No Zora coins found for this address
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Update Metadata URI:</label>
          <input
            type="text"
            placeholder="ipfs://..."
            value={newURI}
            onChange={e => setNewURI(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <button
            onClick={handleUpdateURI}
            disabled={loading || !account || !selectedCoin || !newURI}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 w-full text-sm"
          >
            {loading ? "Updating..." : "Update Metadata"}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Update Payout Recipient:</label>
          <input
            type="text"
            placeholder="0x..."
            value={newPayout}
            onChange={e => setNewPayout(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <button
            onClick={handleUpdatePayout}
            disabled={loading || !account || !selectedCoin || !newPayout}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 w-full text-sm"
          >
            {loading ? "Updating..." : "Update Payout"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="text-green-600 text-sm break-all">
          Update successful! Tx: {result?.hash || JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
