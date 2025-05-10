'use client'

import dynamic from 'next/dynamic';

const FlipbookView = dynamic(() => import('./FlipbookView'), { ssr: false });

export default function Page() {
  return <FlipbookView />;
}
