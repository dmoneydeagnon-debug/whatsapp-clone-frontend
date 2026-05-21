import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>{title}</h1>
        <p style={{ color: '#94a3b8' }}>This page is a temporary placeholder.</p>
      </div>
    </div>
  );
}

