'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function FlipbookView() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchFlipbook = async () => {
      try {
        const res = await fetch(`/api/createFlipbook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });
        const { flipbookHtml } = await res.json();
        setHtml(flipbookHtml);
      } catch (err) {
        console.error('Failed to load flipbook', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlipbook();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-gray-600 px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold mb-2">Failed to load flipbook</h2>
        <p className="mb-4">Something went wrong while loading the flipbook. Please try again later or contact your studio.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }
  

  return (
    <iframe
      srcDoc={html}
      title="Flipbook"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}
