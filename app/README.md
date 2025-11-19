# Zeep Polarization Lab

A single-page social simulation built with React and Vite. Players answer coded and political questions (Dogs vs Cats, Rent control vs Free market, etc.), get sorted into Glorp or Splink, scroll a zeep-crafted social feed, rate every post from 1–9, then try to classify the zeep authors before seeing how well their judgments align with reality.

All of the content is powered by JSON-style data in `src/data.js`: the questions, zeep personas, post generators, and the feed builder that remaps opinions based on the user’s answers.

## Getting started

Requirements: Node.js 18+ and npm.

```bash
cd app
npm install
npm run dev
```

The dev server runs at http://localhost:5173 with hot reload enabled.

To create an optimized build:

```bash
npm run build
npm run preview
```

## Project notes

- `src/data.js` contains the full questionnaire, persona definitions, and the helpers that create six posts per zeep from the player-defined party positions.
- `src/App.jsx` orchestrates the four stages: quiz, party reveal, feed ratings, and the zeep sorting results screen.
- Styling lives in `src/App.css` with lightweight utility classes, no external CSS frameworks required.

## Deployment (Netlify)

Please avoid Vercel—this project is configured to deploy smoothly on Netlify’s free tier:

1. Push the repository to GitHub (or any Git provider Netlify supports).
2. Create a new Netlify site, connect the repo, and set the build command to `npm run build` with the publish directory `dist`.
3. Netlify auto-installs dependencies, builds the Vite app, and serves the static output globally.

Alternatively, use the Netlify CLI locally (`npm install -g netlify-cli`, `netlify init`, `netlify deploy`) if you prefer manual control.
