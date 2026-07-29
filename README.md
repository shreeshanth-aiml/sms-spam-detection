<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/885247e8-18a6-4cc0-8b57-1975a3ba6730

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

Recommended: deploy to Vercel for fast, automatic previews and easy custom domains.

Steps to deploy on Vercel:

1. Visit https://vercel.com/import and choose "Import Git Repository".
2. Select the GitHub repository `shreeshanth-aiml/sms-spam-detection-studio`.
3. Set the Framework Preset to `Vite` (or leave auto-detect).
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Click Deploy — Vercel will build and publish the site with automatic previews.

Alternatively the repository already contains a `gh-pages` branch and a GitHub Actions workflow to publish to GitHub Pages.

