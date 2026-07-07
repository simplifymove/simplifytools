'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: '100vh', padding: '96px 24px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <p style={{ color: '#ea580c', fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
              Something went wrong
            </p>
            <h1 style={{ marginTop: 16, color: '#111827', fontSize: 32 }}>
              We could not load SimplifyConvert.
            </h1>
            <p style={{ marginTop: 16, color: '#4b5563', lineHeight: 1.6 }}>
              Please try again. If the problem continues, contact info@simplifyconvert.com.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 32,
                border: 0,
                borderRadius: 6,
                background: '#ea580c',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 20px',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
