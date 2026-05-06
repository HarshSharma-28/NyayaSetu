'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#020d1a', color: '#ffffff', fontFamily: 'sans-serif', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ backgroundColor: '#06111f', border: '1px solid #dc2626', borderRadius: '8px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ color: '#f87171', margin: '0 0 20px' }}>Critical Error</h1>
          <p style={{ color: '#a1a1aa', margin: '0 0 30px' }}>The application encountered a critical failure at the root level.</p>
          
          {error.digest && (
            <div style={{ backgroundColor: '#020d1a', padding: '10px', borderRadius: '4px', marginBottom: '30px', fontSize: '12px', fontFamily: 'monospace', color: '#71717a' }}>
              Reference: {error.digest}
            </div>
          )}

          <button 
            onClick={() => reset()}
            style={{ backgroundColor: '#d4af37', color: '#06111f', border: 'none', padding: '12px 24px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
