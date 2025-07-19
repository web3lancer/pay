import { useState } from 'react';

export function WalletSelector({ wallets, onConnect, onDisconnect }: { wallets: any[]; onConnect: (wallet: any) => void; onDisconnect: () => void }) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div>
      <button onClick={onDisconnect}>Disconnect</button>
      <ul>
        {wallets.map((wallet) => (
          <li key={wallet.name}>
            <button onClick={() => { setSelected(wallet); onConnect(wallet); }}>
              {wallet.name}
            </button>
          </li>
        ))}
      </ul>
      {selected && <div>Selected: {selected.name}</div>}
    </div>
  );
}

// No changes needed, just ensure usage is limited to relevant pages
