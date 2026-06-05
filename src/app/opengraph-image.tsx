import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Transfera — Egypt Airport Transfers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Brand name */}
        <div
          style={{
            color: '#f59e0b',
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: '-3px',
            lineHeight: 1,
          }}
        >
          Transfera
        </div>

        {/* Service line */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 38,
            fontWeight: 500,
            marginTop: 24,
            letterSpacing: '0.5px',
          }}
        >
          Egypt Airport Transfers
        </div>

        {/* City pills */}
        <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
          {['Hurghada', 'Cairo', 'Sharm El Sheikh', 'Luxor', 'Marsa Alam'].map(
            (city) => (
              <div
                key={city}
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: '#94a3b8',
                  fontSize: 20,
                  padding: '7px 18px',
                  borderRadius: 40,
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {city}
              </div>
            ),
          )}
        </div>

        {/* Value props */}
        <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
          {['Fixed Price', 'Free Cancellation', '24/7 Support'].map((prop) => (
            <div
              key={prop}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span style={{ color: '#cbd5e1', fontSize: 20 }}>{prop}</span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            color: '#10b981',
            fontSize: 22,
            marginTop: 52,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          transfera.ae
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
