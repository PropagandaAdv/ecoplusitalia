# Ecoplus Group · Homepage

Nuova homepage di [ecoplusitalia.com](https://www.ecoplusitalia.com/): React + Tailwind CSS, componente unico in `src/EcoplusHomepage.jsx`, icone lucide-react.

## Avvio

```bash
npm install
npm run dev      # http://localhost:5195
npm run build    # output in dist/
```

## Note

- Hero scroll-driven: `public/assets/hero-scrub.mp4` (10 s, keyframe ogni 8 frame), caricato come Blob solo su desktop. Telefoni e tablet in verticale usano tre fotogrammi in dissolvenza; con `prefers-reduced-motion` l'hero è statica.
- Modulo contatti: imposta `CONFIG.formEndpoint` in `src/EcoplusHomepage.jsx` (POST JSON). Se vuoto, apre il client email verso info@ecoplusitalia.com.
- Al deploy: aggiornare `og:url` e `og:image` in `index.html` con URL assoluti.
- Immagini e video generati con AI (Magnific: Seedream 5 Pro, Kling 2.5).
