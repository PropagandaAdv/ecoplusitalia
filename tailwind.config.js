/** Design token EcoPlus Group: unica fonte di verità per colori, font e curve. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0B2D59',   // primario: titoli, pulsanti primari, sezioni dark
          green: '#66B226',  // secondario/accento: CTA su scuro, parole chiave, focus
          mist: '#F4F6F8',   // sezioni alternate
          ink: '#1E293B',    // testo corpo, footer
        },
      },
      fontFamily: { sans: ['"Josefin Sans"', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 24px 60px -20px rgba(11,45,89,0.22)',
        glass: '0 30px 80px -24px rgba(11,45,89,0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};
