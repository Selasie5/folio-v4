This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Portfolio content management

The portfolio uses Sanity as its content source and keeps a local fallback in
`src/content/fallback.ts`. Until Sanity environment variables are configured,
the site renders the fallback so local development and deployments remain safe.

### Connect Sanity

1. Create a project at [sanity.io/manage](https://sanity.io/manage) with a
   `production` dataset.
2. Copy `.env.example` to `.env.local` and add the project ID.
3. Copy `studio/.env.example` to `studio/.env` and add the same project ID.
4. Run `npm install` inside `studio/` once.
5. Start the editor with `npm run cms` from the repository root.
6. Open the Portfolio document, enter the existing content, and publish it.

The website checks Sanity once per minute and falls back to local content when
the project is unavailable or the Portfolio document has not been published.

The intro defaults and inline links live in `src/content/biography.ts`. The original
seeded biography is replaced with these defaults until it is edited in Sanity;
any changed biography takes precedence. Biography links match their link text
exactly and can be managed under Profile > Biography links in Studio. Branded
links reveal a logo and brand color on hover or keyboard focus; other links use
an underline. Touch devices show the brand treatment without requiring a hover.

The homepage logo list is managed under **Organizations** in Studio. Set its
heading, add organization names and logo images, optionally link their websites,
and drag entries to reorder them. Until the list is configured, the homepage
reuses saved work experience logos alongside Forge Studios and Blackhorse.
Publishing an empty list hides the section. The previous project and experience
records are retained in Studio.

### Deploy the editor

Run `npm run cms:deploy` and follow the Sanity CLI prompt to choose a hosted
Studio hostname. Content editors can then update the site without repository
access or code changes.

For production, add `NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_SANITY_API_VERSION` to the site
hosting environment.

## Getting Started

Development output lives in `.next-dev`; production builds and `npm start` use
`.next`. This keeps `npm run build` from replacing manifests used by a running
development server. Restart an existing dev server once after pulling this change.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
