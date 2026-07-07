export default function Custom500() {
  return (
    <main style={{ minHeight: '100vh', padding: '96px 24px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{ color: '#ea580c', fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
          Server error
        </p>
        <h1 style={{ marginTop: 16, color: '#111827', fontSize: 32 }}>
          We could not load this page.
        </h1>
        <p style={{ marginTop: 16, color: '#4b5563', lineHeight: 1.6 }}>
          Please try again. If the problem continues, contact info@simplifyconvert.com.
        </p>
      </div>
    </main>
  );
}
