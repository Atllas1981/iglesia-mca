import React from 'react';

export const Logo = (props: any) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
      <img
        src="https://iglesia-mca.pages.dev/favicon.svg"
        alt="Iglesia MCA Logo"
        style={{ width: '1.5em', height: '1.5em', objectFit: 'contain' }}
      />
      <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{props.title || 'MCA Panel'}</span>
    </div>
  );
};
