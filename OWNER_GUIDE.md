# Portfolio Owner Studio

Click **Owner** at the bottom of the public portfolio, or visit `/owner`.

## First login

The first owner account is protected by a private setup key. In Netlify → Project configuration → Environment variables, set:

- `OWNER_SETUP_TOKEN`: a randomly generated secret of at least 32 characters.
- `OWNER_SESSION_SECRET`: a separate randomly generated secret of at least 32 characters.

Use **Functions** scope and the **production** deploy context. Redeploy after changing environment variables. Never prefix secrets with `VITE_` or commit them to Git.

Open `/owner`, enter the private setup key, and choose your username and a password of at least 12 characters. Alternatively use `/owner#setup=YOUR_PRIVATE_SETUP_KEY`; the page removes the key from the address bar immediately. This setup key works only until the first owner has been created. There is no public registration or default password.

After setup, log in with your chosen username and password. Update them under **Login & security**, using your current password. Password updates invalidate existing sessions. Sessions expire after 8 hours. Sign out when finished.

If you lose your password, use the authenticated Netlify dashboard's Blobs browser to remove only `credentials` in `portfolio-owner-production`, change both environment secrets, and redeploy. Then create your owner login again with the new private setup key. Keep access to your Netlify account secure.

## Customize your portfolio

- **Profile & about:** name, job title, photo, introductions, traits, contact details, availability.
- **Resume:** upload or replace your latest resume PDF and change the button text.
- **Projects:** descriptions, technologies, cover images, live links, source repositories, supporting PDFs.
- **Experience, education, qualifications, certifications:** organizations, dates, achievements, images, credential links, and PDF evidence.
- **Thoughts & notes:** publish thoughts, articles, and updates.
- **Skills, achievements, goals, aspirations, interests, profile stats, social links:** add, edit, delete, and reorder entries.
- **Site settings:** page title, search description, accent color, footer, contact section, JSON backups.

Each collection has editable headings and introductions and can be hidden. Empty collections are automatically omitted from the public site. Use up/down buttons to reorder entries within a collection.

Edits are saved as a **browser draft** after a short pause; restoring a draft is offered after login. **Preview** opens the draft in a new tab. **Publish** saves it to Netlify and makes it visible to visitors. Visitors receive updates when they reload the portfolio. Use **Export JSON backup** before major edits; imported backups remain drafts until published. Exported JSON references uploaded files; it does not embed their bytes. Back up originals separately.

Upload JPG, PNG, WebP, or PDF files up to **4 MB** each. Uploads require owner authentication and are checked by file signature. Files uploaded for use in the portfolio have public download URLs. Removing a file from an entry removes the link; it does not delete the stored file. This avoids breaking older links. For larger documents use a public HTTPS file URL.

Your live portfolio's existing profile, resume, education, projects, skills, certifications, and contact details are the initial content. No new resume, work history, or certificate PDF has been invented. Use the dashboard to upload newer documents when ready.

## Run and deploy

Requires Node.js 22.12+ (Netlify build uses Node 22).

```sh
npm ci
npm run build
npx netlify dev
```

For local owner setup, use a git-ignored `.env` containing separate development values for `OWNER_SETUP_TOKEN` and `OWNER_SESSION_SECRET`. `npm run dev` alone previews the public UI but does not start server functions.

Netlify uses `netlify.toml`: build `npm run build`, publish `dist`, functions `netlify/functions`, and SPA routing for `/owner`. Publish through the Git repository connected to your existing Netlify project. This requires **functions**, so a static `dist` upload alone does not include the dashboard backend.

Data and files persist across production redeploys in Netlify Blobs. Production, preview, and local store names are isolated. Preview accounts and content are not production accounts or content. Runtime secrets must be configured for any context in which you want owner setup to work.

## Checks

```sh
npm run build
npm run typecheck
npm test
```

The backend integration test uses the Netlify local Blobs server in a temporary test directory. It never touches production content or credentials. Authentication tests cover first setup, wrong credentials, protected writes and uploads, cross-origin rejection, publishing, file delivery, password changes, invalidated sessions, and setup replay.
