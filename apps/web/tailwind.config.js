/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // DroneWatch design system
        base:    '#0b0e14',
        panel:   '#0f1319',
        card:    '#131820',
        card2:   '#161c26',
        input:   '#0d1018',
        accent:  '#00c8f0',
        danger:  '#ff4040',
        warning: '#f0a500',
        success: '#00e676',
        inactive:'#4a5568',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        ui:   ['"Barlow"', 'sans-serif'],
        hd:   ['"Barlow Condensed"', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
        xs:    '0.75rem',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'pulse-fast': 'pulse 0.8s ease-in-out infinite',
        'ping-slow':  'ping 2s ease-out infinite',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.45' },
        },
      },
    },
  },
  plugins: [],
}
