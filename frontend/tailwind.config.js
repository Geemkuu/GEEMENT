export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1220',
        panel: '#121c2e',
        glow: '#31d8ff',
        accent: '#8c80ff',
        neon: '#26e0ff'
      },
      boxShadow: {
        glow: '0 0 30px rgba(50, 216, 255, 0.18)'
      }
    }
  },
  plugins: []
};
