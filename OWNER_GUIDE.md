# Portfolio Owner Studio

Click **Owner** at the bottom of the public portfolio, or visit `/owner`.

## First login

The first owner account is protected by a private, randomly generated 256-bit setup key provided separately. The production server contains only its SHA-256 verification digest, which cannot be used as the key. The private setup key is never included in the website or source repository. No Netlify environment setup is required for this production deployment.

Open `/owner`, enter the private setup key, and choose your username and a password of at least 12 characters. Alternatively use `/owner#setup=YOUR_PRIVATE_SETUP_KEY`; the page removes the key from the address bar immediately. This setup key works only until the first owner has been created. There is no public registration or default password.

After setup, log in with your chosen username and password. Update them under **Login & security**, using your current password. Password updates invalidate existing sessions. Sessions expire after 8 hours. Sign out when finished.

Session signing keys are generated on the server and kept inside the private owner credentials record in Netlify Blobs. They rotate when the password changes. No signing secret is sent to the browser or included in the source code.

If you lose your password, use the authenticated Netlify dashboard's Blobs browser to remove only `credentials` in `portfolio-owner-production`, then use your private setup link to create your owner login again. To replace a lost setup key, set a new random `OWNER_SETUP_TOKEN` with **Functions** scope for **production**, redeploy, and use that new key. Keep access to your Netlify account secure. Never prefix secrets with `VITE_` or commit them to Git.

## Customize your portfolio

- **Profile & about:** name, job title, photo, introductions, traits, contact details, availability.
- **Resume:** upload or replace your latest resume PDF and change the button text.
- **Projects:** descriptions, technologies, cover images, live links, source repositories, supporting PDFs. Every project has an always-visible **GitHub repository URL (optional)** field. Leave it blank to hide the reference; add or change it and click **Publish** to display a clickable GitHub reference on the public card. Clearing it and publishing removes the reference.
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

For local owner setup, use a git-ignored `.env` containing a separate development value for `OWNER_SETUP_TOKEN`. `npm run dev` alone previews the public UI but does not start server functions. The production verification digest is not accepted in local or preview contexts.

Netlify uses `netlify.toml`: build `npm run build`, publish `dist`, functions `netlify/functions`, and SPA routing for `/owner`. Publish through the Git repository connected to your existing Netlify project. This requires **functions**, so a static `dist` upload alone does not include the dashboard backend.

Data and files persist across production redeploys in Netlify Blobs. Production, preview, and local store names are isolated. Preview accounts and content are not production accounts or content. For local or preview owner setup, configure a separate `OWNER_SETUP_TOKEN` in that context.

## Portfolio assistant

The public portfolio includes a built-in assistant for projects, skills, education, certifications, experience, thoughts, resume links, and contact information. It answers from the same portfolio content displayed to visitors; publishing updates in Owner Studio updates its information too. Hidden collections are excluded. It is a portfolio guide, not a general-purpose AI or a live contact agent. It does not send visitor questions to an external chatbot service. The unavailable third-party widget has been removed.

The browser tab icon uses the HM monogram in SVG and ICO formats.

## Checks

```sh
npm run build
npm run typecheck
npm test
npm run test:assistant
```

The backend integration test uses the Netlify local Blobs server in a temporary test directory. It never touches production content or credentials. Authentication tests cover first setup, wrong credentials, protected writes and uploads, cross-origin rejection, publishing, file delivery, password changes, invalidated sessions, and setup replay.
