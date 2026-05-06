/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020d1a',
          900: '#06111f',
          800: '#0a1828',
          700: '#0d1f35',
          600: '#112644',
        },
        gold: {
          400: '#fbbf24',
          500: '#d4af37',
          600: '#c9a227',
        },
        saffron: '#FF9933',
        'india-green': '#138808',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #fbbf24 50%, #d4af37 100%)',
        'gradient-navy': 'linear-gradient(135deg, #06111f 0%, #0d1f35 100%)',
        'gradient-aurora': `linear-gradient(
          135deg,
          rgba(212,175,55,0.08) 0%,
          rgba(19,136,8,0.04) 30%,
          rgba(255,153,51,0.04) 60%,
          rgba(212,175,55,0.08) 100%
        )`,
      },
      boxShadow: {
        gold: '0 0 20px rgba(212,175,55,0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slow-spin': 'slowSpin 80s linear infinite',
        'gold-pulse': 'goldPulse 2s ease infinite',
        'shake': 'shake 0.4s ease',
      },
    },
  },
  plugins: [],
};
