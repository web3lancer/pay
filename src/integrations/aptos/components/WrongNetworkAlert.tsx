export function WrongNetworkAlert({ currentNetwork, requiredNetwork }: { currentNetwork: string; requiredNetwork: string }) {
  if (currentNetwork === requiredNetwork) return null;
  return (
    <div style={{ background: "#fee", padding: "1em", borderRadius: "8px" }}>
      <strong>Wrong Network</strong>
      <div>
        Your wallet is on <b>{currentNetwork}</b>. Please switch to <b>{requiredNetwork}</b> to continue.
      </div>
    </div>
  );
}
