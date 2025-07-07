import React from 'react';

export function BlendPoolWidget({ pool }: { pool: any }) {
  if (!pool) return <div>Loading pool...</div>;
  return (
    <div>
      <h3>Blend Pool</h3>
      <pre>{JSON.stringify(pool, null, 2)}</pre>
    </div>
  );
}
