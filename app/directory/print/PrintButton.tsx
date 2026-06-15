'use client';

import React from 'react';

export function PrintButton() {
  return (
    <button 
      className="btn btn-primary"
      onClick={() => window.print()}
    >
      Open Print Dialog
    </button>
  );
}
